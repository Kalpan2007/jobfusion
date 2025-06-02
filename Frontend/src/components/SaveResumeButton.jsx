import React, { useState } from "react";
import { Bookmark, Bookmarks } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

// Custom styles for Modal
Modal.setAppElement("#root"); // Ensure this matches your root element ID

const SaveResumeButton = ({ resumeData, onToggle }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [title, setTitle] = useState("");

  const handleSaveClick = () => {
    if (!localStorage.getItem("userEmail")) {
      toast.error("Please log in to save resumes.", { position: "top-center", autoClose: 2000 }); // 2-second toast
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveResume = async (resumeTitle) => {
    const email = localStorage.getItem("userEmail");

    try {
      console.log("Saving resumeData:", resumeData);      const response = await axios.post("http://localhost:5000/api/resumes/save", {
        email,
        resumeData: {
          ...resumeData,
          templateId: resumeData.templateId || 'template01' // Ensure templateId is set
        },
        title: resumeTitle,
      });
      setBookmarked(true);
      toast.success("Resume saved successfully!", { position: "top-center", autoClose: 2000 }); // 2-second toast
      if (onToggle) onToggle();
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume. Check console for details.", { position: "top-center", autoClose: 2000 }); // 2-second toast
      setBookmarked(false);
    } finally {
      setIsSaveModalOpen(false);
      setTitle("");
    }
  };

  const handleDeleteResume = async () => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      toast.error("Please log in to delete resumes.", { position: "top-center", autoClose: 2000 }); // 2-second toast
      return;
    }

    try {
      await axios.delete("https://jobfusion.onrender.com/api/resumes/unsave", {
        data: { email, resumeId: resumeData._id },
      });
      setBookmarked(false);
      toast.success("Resume deleted successfully!", { position: "top-center", autoClose: 2000 }); // 2-second toast
      if (onToggle) onToggle();
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume.", { position: "top-center", autoClose: 2000 }); // 2-second toast
    }
  };

  return (
    <>
      <button
        onClick={handleSaveClick}
        className="p-2 rounded-full bg-transparent border-none cursor-pointer"
        disabled={bookmarked}
      >
        <AnimatePresence mode="wait">
          {bookmarked ? (
            <motion.div
              key="added"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Bookmarks fontSize="large" style={{ color: "lightblue" }} />
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Bookmark fontSize="large" style={{ color: "lightblue" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Save Resume Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onRequestClose={() => setIsSaveModalOpen(false)}
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "300px",
            padding: "20px",
            borderRadius: "8px",
          },
        }}
      >
        <h2 className="text-lg font-bold mb-4">Save Resume</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter resume title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsSaveModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSaveResume(title)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </Modal>

      {/* Toast Container */}
      <ToastContainer autoClose={2000} hideProgressBar={false} /> {/* Set toast duration to 2 seconds */}
    </>
  );
};

export default SaveResumeButton;