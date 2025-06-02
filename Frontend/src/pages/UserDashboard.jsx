import { useState, useEffect } from "react";
import { Menu, X, Database, User, FileText, Download, Trash2, Eye } from "lucide-react";
import { Phone, Mail, MapPin, Globe } from "lucide-react"; // Added missing icons
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BookmarkButton from "../components/SaveBtn";
import { Document, Page, View, Text, StyleSheet, pdf } from "@react-pdf/renderer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Template Placeholder Components (for reference)
const Template01 = () => <div>Template 01 Content</div>;
const Template02 = () => <div>Template 02 Content</div>;

// Template03 Component for PDF (extracted for reuse)
const Template03 = ({ resumeData }) => {
  const styles = StyleSheet.create({
    page: { padding: 30, backgroundColor: "#ffffff", fontSize: 10 },
    header: {
      textAlign: "center",
      marginBottom: 15,
      backgroundColor: "#E0F6F6",
    },
    name: { fontSize: 24, fontWeight: "bold", color: "#333333" },
    title: { fontSize: 14, fontWeight: "medium", color: "#333333", marginTop: 3 },
    contact: { fontSize: 10, color: "#666666", marginTop: 3, fontWeight: "light" },
    section: { marginBottom: 15, backgroundColor: "#ffffff" },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#333333",
      borderBottom: "1px solid #D3E4E5",
      paddingBottom: 3,
      marginBottom: 8,
    },
    text: { fontSize: 10, color: "#4a4a4a", marginBottom: 3, fontWeight: "light" },
    item: { marginBottom: 8 },
    itemTitle: { fontWeight: "bold", fontSize: 12, color: "#4a4a4a" },
    listItem: { marginLeft: 16, marginBottom: 4 },
    icon: { display: "inline", marginRight: 8, color: "#D3E4E5", width: 14, height: 14 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { backgroundColor: resumeData.primaryColor || "#E0F6F6" }]}>
          <Text style={[styles.name, { color: resumeData.headerTextColor || "#333333" }]}>
            {resumeData.name || "Your Name"}
          </Text>
          <Text style={[styles.title, { color: resumeData.headerTextColor || "#333333" }]}>
            {resumeData.title || "Your Title"}
          </Text>
          <Text style={[styles.contact, { color: resumeData.headerTextColor || "#666666" }]}>
            {resumeData.phone || "Phone"} | {resumeData.email || "Email"} | {resumeData.address || "Address"} | {resumeData.website || "Website"}
          </Text>
        </View>
        {resumeData.sectionOrder
          ?.filter((section) => resumeData.sectionVisibility?.[section])
          .map((section) => (
            <View key={section} style={[styles.section, { backgroundColor: resumeData.sectionStyles?.[section]?.bgColor || "#ffffff" }]}>
              <Text style={[styles.sectionTitle, { color: resumeData.headerTextColor || "#333333" }]}>
                {section === "contact" && "Contact"}
                {section === "education" && "Education"}
                {section === "skills" && "Skills"}
                {section === "profile" && "Profile Summary"}
                {section === "workExperience" && "Work Experience"}
              </Text>
              {section === "contact" && (
                <>
                  <Text style={[styles.text, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                    <Phone style={styles.icon} /> {resumeData.phone || "Phone"}
                  </Text>
                  <Text style={[styles.text, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                    <Mail style={styles.icon} /> {resumeData.email || "Email"}
                  </Text>
                  <Text style={[styles.text, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                    <MapPin style={styles.icon} /> {resumeData.address || "Address"}
                  </Text>
                  <Text style={[styles.text, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                    <Globe style={styles.icon} /> {resumeData.website || "Website"}
                  </Text>
                </>
              )}
              {section === "education" &&
                resumeData.education?.map((edu, index) => (
                  <View key={index} style={styles.item}>
                    <Text style={[styles.itemTitle, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                      {edu.university || "University"} - {edu.degree || "Degree"}
                    </Text>
                    <Text style={[styles.text, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                      {edu.period || "Period"} {edu.gpa ? `| GPA: ${edu.gpa}` : ""}
                    </Text>
                  </View>
                ))}
              {section === "skills" &&
                resumeData.skills?.map((skill, index) => (
                  <Text key={index} style={[styles.listItem, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                    • {skill || "Skill"}
                  </Text>
                ))}
              {section === "profile" && (
                <Text style={[styles.text, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                  {resumeData.profile || "Profile Summary"}
                </Text>
              )}
              {section === "workExperience" &&
                resumeData.workExperience?.map((exp, index) => (
                  <View key={index} style={styles.item}>
                    <Text style={[styles.itemTitle, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                      {exp.company || "Company"} - {exp.role || "Role"}
                    </Text>
                    <Text style={[styles.text, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                      {exp.period || "Period"}
                    </Text>
                    {exp.achievements?.map((achievement, i) => (
                      <Text key={i} style={[styles.listItem, { color: resumeData.sectionStyles?.[section]?.textColor || "#4a4a4a" }]}>
                        • {achievement || "Achievement"}
                      </Text>
                    ))}
                  </View>
                ))}
            </View>
          ))}
      </Page>
    </Document>
  );
};

// PDF Preview Component
const ResumePDFPreview = ({ resumeData }) => {
  const generatePDF = async () => {
    try {
      console.log("Previewing resumeData:", resumeData);
      const TemplateComponent = getTemplateComponent(resumeData.templateId, resumeData);
      const blob = await pdf(TemplateComponent).toBlob();
      if (!blob) {
        throw new Error("Failed to generate PDF blob for preview");
      }
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("Preview opened successfully!", { position: "top-center", autoClose: 2000 });
    } catch (error) {
      console.error("Error previewing PDF:", error);
      toast.error("Failed to preview resume. Check console for details.", { position: "top-center", autoClose: 2000 });
    }
  };

  return (
    <button onClick={generatePDF} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
      <Eye size={18} />
    </button>
  );
};

// Helper function to get the correct template component
const getTemplateComponent = (templateId, resumeData) => {
  console.log("Getting template component for templateId:", templateId, "with resumeData:", resumeData);
  switch (templateId) {
    case "template01":
      return <Template01 resumeData={resumeData} />;
    case "template02":
      return <Template02 resumeData={resumeData} />;
    case "template03":
      return <Template03 resumeData={resumeData} />;
    default:
      console.warn("Unknown templateId, defaulting to Template03:", templateId);
      return <Template03 resumeData={resumeData} />;
  }
};

// Resume Item Component
const ResumeCard = ({ resume, onDelete }) => {
  const handleDownload = async () => {
    try {
      console.log("Downloading resumeData:", resume.resumeData);
      const TemplateComponent = getTemplateComponent(resume.resumeData.templateId, resume.resumeData);
      const blob = await pdf(TemplateComponent).toBlob();
      if (!blob) {
        throw new Error("Failed to generate PDF blob for download");
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!", { position: "top-center", autoClose: 2000 });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF. Check console for details.", { position: "top-center", autoClose: 2000 });
    }
  };

  const handleDelete = async () => {
    const email = localStorage.getItem("userEmail");
    try {
      await axios.delete("http://localhost:5000/api/resumes/unsave", {
        data: { email, resumeId: resume._id },
      });
      toast.success("Resume deleted successfully!", { position: "top-center", autoClose: 2000 });
      onDelete(resume._id);
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume.", { position: "top-center", autoClose: 2000 });
    }
  };

  return (
    <div className="bg-black p-4 rounded-lg shadow-md mb-4 flex justify-between items-center hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="text-blue-500" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-800 truncate" title={resume.title}>
            {resume.title}
          </p>
          <p className="text-sm text-gray-500">{new Date(resume.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex space-x-2 flex-shrink-0 ml-4">
        <ResumePDFPreview resumeData={resume.resumeData} />
        <button onClick={handleDownload} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
          <Download size={18} />
        </button>
        <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const JobCard = ({ job, onToggle }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-black p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer relative">
      <div className="absolute top-4 right-4">
        <BookmarkButton job={job} onToggle={onToggle} />
      </div>
      <div onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })} className="flex flex-col">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
          <Database className="text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{job.company.display_name}</p>
        <p className="text-sm text-gray-500">{job.location.display_name}</p>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedResumes, setSavedResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmail = localStorage.getItem("userEmail");
        if (!storedEmail) {
          setError("No email found in local storage.");
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/users/profile/${storedEmail}`);
        if (response.data.success) {
          setUserData(response.data.data);
        } else {
          setError("Failed to fetch user data.");
        }
      } catch (err) {
        setError("Error fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedData = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        try {
          // Fetch saved jobs
          const jobsResponse = await axios.get(`http://localhost:5000/api/jobs/saved/${email}`);
          if (jobsResponse.data.success) {
            setSavedJobs(jobsResponse.data.data.map((item) => item.jobData));
          }

          // Fetch saved resumes
          const resumesResponse = await axios.get(`http://localhost:5000/api/resumes/saved/${email}`);
          if (resumesResponse.data.success) {
            console.log("Fetched saved resumes:", resumesResponse.data.data);
            setSavedResumes(resumesResponse.data.data);
          }
        } catch (err) {
          console.error("Error fetching saved data:", err);
          setError("Error fetching saved data.");
        }
      }
    };

    fetchUserData();
    fetchSavedData();
  }, []);

  const handleDeleteResume = (resumeId) => {
    setSavedResumes(savedResumes.filter((resume) => resume._id !== resumeId));
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-black-50">
      {/* Header with User Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-6">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Saved Jobs Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Saved Jobs</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Resume Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Saved Resumes</h2>
              <div className="space-y-4">
                {savedResumes.length > 0 ? (
                  savedResumes.map((resume) => (
                    <ResumeCard key={resume._id} resume={resume} onDelete={handleDeleteResume} />
                  ))
                ) : (
                  <p className="text-gray-500">No saved resumes yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer autoClose={2000} hideProgressBar={false} />
    </div>
  );
};

export default UserDashboard;