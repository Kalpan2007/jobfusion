import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { FaStar } from "react-icons/fa";
import axios from "axios";

const ReviewComponent = () => {
    const [reviews, setReviews] = useState([]);
    const [open, setOpen] = useState(false);
    const [newReview, setNewReview] = useState({ username: "", rating: 0, review: "" });
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/reviews");
            setReviews(response.data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handleSubmit = async () => {
        if (!newReview.username || !newReview.review || newReview.rating === 0 || loading) return;
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/api/reviews", newReview);
            fetchReviews();
            setOpen(false);
            setNewReview({ username: "", rating: 0, review: "" });
        } catch (error) {
            console.error("Error submitting review:", error);
        }finally{
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-black-50 min-h-screen">
            <h2 className="text-2xl font-bold text-center mb-6 text-[#688BC5]">Client Testimonials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {reviews.map((rev, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg shadow-lg text-center border border-[#9BC6F7]">
                        <div className="flex justify-center mb-2">
                            {[...Array(rev.rating)].map((_, i) => (
                                <FaStar key={i} className="text-yellow-500" />
                            ))}
                        </div>
                        <p className="italic text-gray-700">"{rev.review}"</p>
                        <h4 className="mt-2 font-semibold text-[#688BC5]">- {rev.username}</h4>
                    </div>
                ))}
            </div>

            {/* Floating Add Review Button inside the Component */}
            <div className="flex justify-end mt-6">
                <Button
                    variant="contained"
                    className="bg-[#688BC5] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#5678A6]"
                    onClick={() => setOpen(true)}
                >
                    Add Review
                </Button>
            </div>

            {/* Add Review Modal with Improved Styling */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogContent className="py-10 mt-10">
                    <TextField
                        label="Your Name"
                        fullWidth
                        value={newReview.username}
                        onChange={(e) => setNewReview({ ...newReview, username: e.target.value })}
                        className="mb-4" // Adjusted for bottom margin
                    />
                    <div className="flex gap-2 mb-4 mt-4">  {/* Added margin-top here */}
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                className={newReview.rating > i ? "text-yellow-500 cursor-pointer" : "text-gray-400 cursor-pointer"}
                                onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                            />
                        ))}
                    </div>
                    <TextField
                        label="Your Review"
                        multiline
                        rows={3}
                        fullWidth
                        value={newReview.review}
                        onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                    />
                </DialogContent>
                <DialogActions className="bg-[#F7F9FC]">
                    <Button onClick={() => setOpen(false)} className="text-[#688BC5]">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        className="bg-[#688BC5] text-white"
                        disabled={loading}
                    >
                        { loading ? "Submitting..." : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ReviewComponent;
