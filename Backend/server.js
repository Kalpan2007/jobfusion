require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jobRoutes = require('./src/routes/jobRoutes');
const userRoutes = require('./src/routes/userRoutes'); // Import user routes
const { getTrendingJobs } = require('./src/controllers/jobController');
const savedJobRoutes = require("./src/routes/savedJobRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes"); // Import review routes
const newStailerRoutes = require("./src/routes/newStailerRoutes");
const atsRoutes = require("./src/routes/atsRoutes");
const analyzeRoutes = require("./src/routes/analyzeRoutes");
const UserExperienceRoutes = require('./src/routes/UserExperienceRoutes');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGO_URI; // Use MONGO_URI as per your preference
    const conn = await mongoose.connect(mongoURL); // Removed deprecated options
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};
// Call the function to connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://jobfusionofficial.netlify.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/savedjobs', savedJobRoutes); // Mount saved jobs routes under a distinct path
app.use('/api/reviews', reviewRoutes);
app.use('/api/newstailer', newStailerRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/resume', analyzeRoutes);
app.use('/api/experience', UserExperienceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
