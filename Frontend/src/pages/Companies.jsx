import React, { useState, useEffect } from "react";
import { Database, Search, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BookmarkButton from "../components/SaveBtn";
import axios from "axios";

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer relative">
      <div className="absolute top-4 right-4">
        <BookmarkButton job={job} />
      </div>
      <div
        onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}
        className="flex flex-col"
      >
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
          <Database className="text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
        {job.company && (
          <p className="text-gray-600 text-sm mb-2">{job.company.display_name}</p>
        )}
        {job.location && (
          <p className="text-gray-600 text-sm mb-2">📍 {job.location.display_name}</p>
        )}
        {job.salary_min && (
          <p className="text-green-600 text-sm font-medium">
            💰 ₹{Math.floor(job.salary_min).toLocaleString()} - ₹
            {Math.floor(job.salary_max).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

const SearchBar = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialWhat = searchParams.get("what") || "";
  const initialWhere = searchParams.get("where") || "";

  const [filters, setFilters] = useState({
    what: initialWhat,
    where: initialWhere,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`?what=${filters.what}&where=${filters.where}`, { replace: true });
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-lg shadow-lg">
        <div className="flex-1 flex items-center gap-2 px-4">
          <Search className="text-gray-400" />
          <input
            type="text"
            placeholder="Job title or keyword"
            value={filters.what}
            onChange={(e) => setFilters({ ...filters, what: e.target.value })}
            className="w-full p-2 outline-none"
          />
        </div>
        <div className="flex-1 flex items-center gap-2 px-4 border-t md:border-t-0 md:border-l border-gray-200">
          <MapPin className="text-gray-400" />
          <input
            type="text"
            placeholder="Location"
            value={filters.where}
            onChange={(e) => setFilters({ ...filters, where: e.target.value })}
            className="w-full p-2 outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700"
        >
          Search my job
        </button>
      </div>
    </form>
  );
};

const TrendingJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = {
    what: searchParams.get("what") || "",
    where: searchParams.get("where") || "",
  };

  const fetchJobs = async (filters = {}) => {
  try {
    setLoading(true);
    const ADZUNA_API_ID = import.meta.env.VITE_ADZUNA_API_ID;
    const ADZUNA_API_KEY = import.meta.env.VITE_ADZUNA_API_KEY;

    const params = {
      app_id: ADZUNA_API_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: 20,
      ...filters,
      full_time: filters.full_time ? 1 : 0,
      permanent: filters.permanent ? 1 : 0,
      sort_by: "salary",
    };

    // If there's a location filter, add it to the API call
    if (filters.where) {
      params.where = filters.where;  // Allow partial location search
    }

    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/in/search/1`,
      { params }
    );

    setJobs(response.data.results);
  } catch (error) {
    console.error("Error fetching jobs:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchJobs(searchQuery);
  }, [location.search]);

  return (
    <section className="py-16 px-6 bg-gray min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Explore Jobs That Fit You
        </h2>

        <SearchBar onSearch={fetchJobs} />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No jobs found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingJobs;
