import { useState, useEffect } from "react";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BookmarkButton({ job }) {
  const [bookmarked, setBookmarked] = useState(false);
  
  useEffect(() => {
    const checkSavedStatus = async () => {
      const email = localStorage.getItem("userEmail");
      const token = localStorage.getItem("token");
      
      if (email && token) {
        try {
          const response = await axios.get(`http://localhost:5000/api/savedjobs/saved/${email}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            const savedJobs = response.data.data || [];
            const isJobSaved = savedJobs.some(savedJob => savedJob.jobData.id === job.id);
            setBookmarked(isJobSaved);
          }
        } catch (error) {
          console.error("Error checking saved status:", error);
        }
      }
    };

    checkSavedStatus();
  }, [job.id]);

  const handleClick = async () => {
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");

    if (!email || !token) {
      toast.error("Please log in to save jobs.", { position: "top-center" });
      return;
    }

    // Optimistic UI update
    const newBookmarkedState = !bookmarked;
    setBookmarked(newBookmarkedState);
    
    try {
      if (newBookmarkedState) {
        const jobData = {
          id: job.id,
          jobTitle: job.title || job.jobTitle,
          companyName: job.company || job.companyName,
          location: job.location,
          salary: job.salary,
          description: job.description,
          redirect_url: job.redirect_url
        };

        const response = await axios.post("http://localhost:5000/api/savedjobs/save", { 
          email, 
          jobData 
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          toast.success("Job saved successfully!", { position: "top-center" });
        }
      } else {
        const response = await axios.delete("http://localhost:5000/api/savedjobs/unsave", {
          data: { email, jobId: job.id },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          toast.info("Job removed from saved list.", { position: "top-center" });
        }
      }
    } catch (error) {
      console.error("Error updating saved jobs:", error);
      toast.error("Failed to update saved jobs.", { position: "top-center" });
      setBookmarked(!newBookmarkedState); // Rollback UI on error
    }
  };

  return (
    <>
      <button onClick={handleClick} className="p-2 rounded-full bg-transparent border-none cursor-pointer">
        <AnimatePresence mode="wait">
          {bookmarked ? (
            <motion.div
              key="added"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BookmarkAddedIcon fontSize="large" style={{ color: "lightblue" }} />
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BookmarkAddIcon fontSize="large" style={{ color: "lightblue" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <ToastContainer autoClose={2000} hideProgressBar={false} />
    </>
  );
}
