// --> Prevent Resubmission: Added localStorage to track if a user has already submitted their email, disabling the input and button after the first submission.
// --> Thank You Message: On successful submission, the input turns green and displays a thank-you message.
// --> Optimized UX: Prevents empty or duplicate submissions and auto-clears error messages after a short delay.




import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const submittedEmail = localStorage.getItem('newsletterEmail');
    if (submittedEmail) {
      setHasSubmitted(true);
      setEmail('Thank you for subscribing!');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || hasSubmitted) {
      return; // Prevent empty or duplicate submissions
    }

    try {
      const response = await axios.post('https://jobfusion.onrender.com/api/newStailer', { email });
      if (response.data.success) {
        setIsSuccess(true);
        setHasSubmitted(true);
        setEmail('Thank you for subscribing!'); // Show message inside input
        localStorage.setItem('newsletterEmail', email); // Store email in localStorage
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving email:', error.response?.data?.message || error.message);
      setEmail('Error! Try again later.'); // Error message in input
      setTimeout(() => setEmail(''), 3000); // Clear error message after a few seconds
    }
  };

  return (
    <section className="bg-blue-600 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-white">
          <h3 className="text-xl font-semibold mb-2">Newsletter</h3>
          <p>Be the first to know about discounts, offers, and events.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full md:w-auto gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(isSuccess || hasSubmitted ? email : e.target.value)}
            className={`flex-1 md:w-80 px-4 py-3 rounded-md focus:outline-none bg-white text-gray-700 placeholder-gray-500 ${isSuccess || hasSubmitted ? 'bg-green-100 text-green-700' : ''}`}
            disabled={isSuccess || hasSubmitted}
          />
          <button
            type="submit"
            className="bg-blue-800 text-white px-8 py-3 rounded-md transition-all duration-300 transform hover:scale-105 hover:bg-blue-900 active:scale-95"
            disabled={isSuccess || hasSubmitted}
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;