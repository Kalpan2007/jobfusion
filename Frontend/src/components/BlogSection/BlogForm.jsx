import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spinner from '../Loader';

const SuccessForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    companyName: '',
    salaryRange: '',
    journeyDescription: '',
    image: null,
    image_url: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Form Submitted:', formData);

    const data = new FormData();
    data.append("file", formData.image);
    data.append("upload_preset", "JF_Reviews");
    data.append("cloud_name", "dxdrzit6x");

    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dxdrzit6x/image/upload", data);
      console.log(response.data);
      console.log(response.data.secure_url);
      setFormData((prev) => ({
        ...prev,
        image_url: response.data.secure_url
      }));
      const postRequestData = {
        name: formData.name,
        job_title: formData.jobTitle,
        company_name: formData.companyName,
        salary_range: formData.salaryRange,
        journey_description: formData.journeyDescription,
        image_url: response.data.secure_url
      };

      const mongodbResponse = await axios.post("http://localhost:5000/api/experience/newExperience", postRequestData);
      console.log(response.data);
      console.log(response.data.message);
      navigate("/successstories")
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      return;
    }


  };

  useEffect(()=>{
    (async ()=>{
      if(localStorage.getItem("userEmail") == null){
        navigate("/login");
      }
    })()
  },[])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[#E8F1F9] bg-noise bg-opacity-50 backdrop-blur-md rounded-t-xl p-6">
            <h2 className="text-5xl font-extrabold text-gray-800 tracking-tight mb-2">Share Your Success Story</h2>
            <p className="text-2xl text-gray-800">Inspire others with your journey and achievements.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="grid grid-cols-1 max-sm:grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-xl font-semibold text-gray-800">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-xl font-semibold text-gray-800">Job Title</label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500"
                  placeholder="Enter your new job title"
                  required
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-xl font-semibold text-gray-800">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500"
                  placeholder="Enter the company name"
                  required
                />
              </div>

              <div>
                <label htmlFor="salaryRange" className="block text-xl font-semibold text-gray-800">Salary Range</label>
                <input
                  type="text"
                  id="salaryRange"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500"
                  placeholder="Enter your salary range (e.g., '$50,000 - $70,000')"
                  required
                />
              </div>

              <div className="w-full col-span-2 max-sm:col-span-1">
                <div className="relative w-full ">
                  <label htmlFor="journeyDescription" className="block text-xl font-semibold text-gray-800 mb-2">Your Journey</label>
                  <textarea
                    id="journeyDescription"
                    name="journeyDescription"
                    value={formData.journeyDescription}
                    onChange={handleChange}
                    rows="10"
                    className="w-full mt-2 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y placeholder-gray-400"
                    placeholder="Describe your journey to securing this job..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xl font-semibold text-gray-800">Upload Your Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500"
                    required
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-4 w-full object-cover rounded-lg shadow-md"
                    />
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[url('https://img.freepik.com/free-photo/dark-stone-desk-texture-with-concrete-background-high-resolution-top-view-table-with-copy-space-idea-advertising-banner-product-article_166373-2662.jpg?t=st=1742358637~exp=1742362237~hmac=3585ab4b65a7c8a6ee0862b5a395d8c3a447680a67bacf330f5f406508715a16&w=900')] text-white font-bold rounded-lg shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer backdrop-blur-2xl"
            >
              Submit Your Story
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default SuccessForm;
