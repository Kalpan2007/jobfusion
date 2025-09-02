import { useState, useEffect } from "react";
import { Database, User, LogOut } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BookmarkButton from "../components/SaveBtn";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const JobCard = ({ job, onToggle }) => {
  const navigate = useNavigate();

  if (!job) {
    return null;
  }

  const companyName = job.company?.display_name || job.company?.name || 'Company Name Not Available';
  const locationName = job.location?.display_name || job.location?.name || 'Location Not Available';
  const jobTitle = job.title || 'Job Title Not Available';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer relative">
      <div className="absolute top-4 right-4">
        <BookmarkButton job={job} onToggle={onToggle} />
      </div>
      <div onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })} className="flex flex-col">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
          <Database className="text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{jobTitle}</h3>
        <p className="text-sm text-gray-600 mb-2">{companyName}</p>
        <p className="text-sm text-gray-500">{locationName}</p>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper function to validate token
  const validateToken = (token) => {
    if (!token) return false;
    try {
      // Basic JWT token validation (check if it's expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Helper function to handle auth errors
  const handleAuthError = (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      toast.error("Authentication failed. Please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      navigate("/login");
      return true;
    }
    return false;
  };

  // Helper function to logout user
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmail = localStorage.getItem("userEmail");
        const token = localStorage.getItem("token");
        
        if (!storedEmail || !token) {
          setError("No email or authentication token found.");
          setLoading(false);
          return;
        }

        // Validate token before making request
        if (!validateToken(token)) {
          toast.error("Token expired. Please login again.");
          logout();
          return;
        }

        const response = await axios.get(`https://jobfusion.onrender.com/api/users/profile/${storedEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setUserData(response.data.data);
        } else {
          setError("Failed to fetch user data.");
        }
      } catch (err) {
        if (handleAuthError(err)) {
          return;
        }
        setError("Error fetching user data.");
        console.error("User data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedJobs = async () => {
      const email = localStorage.getItem("userEmail");
      const token = localStorage.getItem("token");
      
      if (!email || !token) {
        return;
      }

      // Validate token before making request
      if (!validateToken(token)) {
        return;
      }

      try {
        const response = await axios.get(`https://jobfusion.onrender.com/api/savedjobs/saved/${email}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          const jobs = response.data.data || [];
          const validJobs = jobs.map(item => {
            const jobData = item.jobData || {};
            return {
              id: jobData.id,
              title: jobData.title,
              company: {
                display_name: jobData.company?.display_name || 'Company Not Available'
              },
              location: {
                display_name: jobData.location?.display_name || 'Location Not Available'
              },
              ...jobData
            };
          }).filter(job => job.id);
          setSavedJobs(validJobs);
        }
      } catch (err) {
        if (handleAuthError(err)) {
          return;
        }
        console.error("Error fetching saved jobs:", err);
        toast.error("Failed to fetch saved jobs");
      }
    };

    fetchUserData();
    fetchSavedJobs();
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full p-1">
                <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={32} className="text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">{userData?.username || "User"}</h2>
                <p className="text-blue-100 text-sm">{userData?.email || "email@example.com"}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Saved Jobs</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.length > 0 ? (
              savedJobs.map((job) => (
                <JobCard key={job.id} job={job} onToggle={() => {}} />
              ))
            ) : (
              <p className="text-gray-500">No saved jobs yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer autoClose={2000} hideProgressBar={false} />
    </div>
  );
};

export default UserDashboard;
