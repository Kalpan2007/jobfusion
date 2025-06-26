import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseIcon, Menu, X, UserIcon } from "lucide-react";

const Header = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-blue-50 px-6 py-4 transition-all duration-300 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <BriefcaseIcon className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">JOB FUSION</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-12.5">
          <Link to="/home" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Home</Link>
          <Link to="/Companies" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Companies</Link>
          <Link to="/resume" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Resume</Link>
          <Link to="/ats-cheking" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">ATS Checking</Link>
          <Link to="/successstories" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Success Stories</Link>
        </nav>

        {/* User Profile & Mobile Menu */}
        <div className="flex items-center gap-4">
          {userEmail ? (
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <UserIcon className="w-8 h-8 text-blue-600 cursor-pointer" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-50">
                  <Link to="/userdashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200">Sign In</Link>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X className="w-7 h-7 text-blue-600" /> : <Menu className="w-7 h-7 text-blue-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col bg-white shadow-md absolute top-16 left-0 w-full p-4 space-y-4 z-50">
          <Link to="/home" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/Companies" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Companies</Link>
          <Link to="/resume" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Resume</Link>
          <Link to="/ats-cheking" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>ATS Checking</Link>
          <Link to="/successstories" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Success Stories</Link>
          {!userEmail && (
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md inline-block w-fit">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
