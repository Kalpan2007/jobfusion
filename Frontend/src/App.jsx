import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Ragister';
import UserDashboard from './pages/UserDashboard';
import JobDetails from "./pages/JobDetails";
import Companies from "./pages/Companies";
import FirstPage from "./pages/FirstPage";
import Header from './components/Header';
import Footer from './components/Footer';
import ResumePage from './pages/ResumePage';
import Templet01 from "./pages/Templets_01";

function App() {
  const location = useLocation(); // Get current route

  // Pages that should not have Header & Footer
  const hideHeaderFooter = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      {/* Show Navbar & Footer only on Home and other main pages */}
      {!hideHeaderFooter && <Header />}

      <Routes>
        {/* Landing Page (First Page) */}
        <Route path="/" element={<FirstPage />} />

        {/* Authentication Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Website After Login */}
        <Route path="/home" element={<Home />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/templet01" element={<Templet01 />} />

        {/* Redirect any unknown route to FirstPage */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Show Footer only on Home and other main pages */}
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

export default App;
