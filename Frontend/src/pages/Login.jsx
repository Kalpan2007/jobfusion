import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseIcon, Eye, EyeOff } from "lucide-react";
import ModernLoader from "../components/Loader";
import axios from "axios";

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        otp: "",
    });
    const [error, setError] = useState("");
    const [view, setView] = useState("login"); // login, verify, forgotPassword, resetPassword
    const navigate = useNavigate();

    const API_BASE_URL = "https://jobfusion.onrender.com/api/users";

    // Function to handle input changes (optimized with useCallback)
    const handleChange = useCallback((e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    }, []);

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loader
        setError("");

        try {
            let endpoint = "";
            let payload = {};

            switch (view) {
                case "login":
                    endpoint = `${API_BASE_URL}/login`;
                    payload = {
                        email: formData.email,
                        password: formData.password,
                    };
                    break;
                case "verify":
                    endpoint = `${API_BASE_URL}/verify-otp`;
                    payload = {
                        email: formData.email,
                        otp: formData.otp
                    };
                    break;
                case "forgotPassword":
                    endpoint = `${API_BASE_URL}/forgot-password`;
                    payload = {
                        email: formData.email
                    };
                    break;
                case "resetPassword":
                    endpoint = `${API_BASE_URL}/reset-password`;
                    payload = {
                        email: formData.email,
                        otp: formData.otp,
                        newPassword: formData.password
                    };
                    break;
                default:
                    throw new Error("Invalid view state");
            }

            const response = await axios.post(endpoint, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                withCredentials: true
            });

            const data = response.data;

            if (view === "login" && data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", formData.email);
                navigate("/home");
            } else if (view === "verify" && data.success) {
                setView("login");
                setError("Email verified successfully. You can now login.");
            } else if (view === "forgotPassword" && data.success) {
                setView("resetPassword");
            } else if (view === "resetPassword" && data.success) {
                setView("login");
                setError("Password reset successful. You can now login with your new password.");
                setFormData(prev => ({...prev, password: "", otp: ""}));
            }
        } catch (error) {
            console.error("Error:", error);
            if (error.response) {
                // Server responded with an error
                setError(error.response.data.message || "An error occurred. Please try again.");
                if (error.response.status === 401) {
                    setError("Invalid credentials. Please try again.");
                }
            } else if (error.request) {
                // Request was made but no response received
                setError("Unable to connect to the server. Please try again later.");
            } else {
                // Something else happened
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false); // Hide loader
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError("");

        try {
            const endpoint = view === "verify" 
                ? "https://jobfusion.onrender.com/api/users/resend-otp" 
                : "https://jobfusion.onrender.com/api/users/forgot-password";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "A new code has been sent to your email");
            } else {
                setError(data.message || "Failed to send code. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        switch (view) {
            case "login":
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                {showPassword ? <EyeOff className="text-gray-500" /> : <Eye className="text-gray-500" />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                onClick={() => setView("forgotPassword")}
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Login Now
                        </button>
                    </form>
                );
            case "verify":
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Your email needs verification. We've sent a verification code to your email address. Please enter the code below.
                        </p>
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter verification code"
                            value={formData.otp}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Verify Email
                        </button>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            className="w-full bg-transparent text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Resend Verification Code
                        </button>
                        <button
                            type="button"
                            onClick={() => setView("login")}
                            className="w-full bg-transparent text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Login
                        </button>
                    </form>
                );
            case "forgotPassword":
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Enter your email address and we'll send you a code to reset your password.
                        </p>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Send Reset Code
                        </button>
                        <button
                            type="button"
                            onClick={() => setView("login")}
                            className="w-full bg-transparent text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Login
                        </button>
                    </form>
                );
            case "resetPassword":
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Enter the code sent to your email and your new password.
                        </p>
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter reset code"
                            value={formData.otp}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="New Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                {showPassword ? <EyeOff className="text-gray-500" /> : <Eye className="text-gray-500" />}
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Reset Password
                        </button>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            className="w-full bg-transparent text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Resend Reset Code
                        </button>
                        <button
                            type="button"
                            onClick={() => setView("login")}
                            className="w-full bg-transparent text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Login
                        </button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex">
            {loading ? (
                <div className="w-full flex justify-center items-center">
                    <ModernLoader />
                </div>
            ) : (
                <>
                    {/* Left Side - Login Form */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
                        <div className="w-full max-w-md">
                            <Link to="/" className="flex items-center gap-2 mb-8">
                                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold">JOB FUSION</span>
                            </Link>

                            <h1 className="text-3xl font-bold mb-2">
                                {view === "login" && "LOGIN"}
                                {view === "verify" && "VERIFY EMAIL"}
                                {view === "forgotPassword" && "FORGOT PASSWORD"}
                                {view === "resetPassword" && "RESET PASSWORD"}
                            </h1>

                            {error && <div className="mb-4 text-red-600">{error}</div>}

                            {renderForm()}

                            {view === "login" && (
                                <div className="mt-8">
                                    <p className="text-center text-gray-600 mb-4">--- OR ---</p>
                                    <div className="space-y-3">
                                        <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                            <span>Login with Google</span>
                                        </button>
                                        <p className="text-center mt-6">
                                            For A New User{" "}
                                            <Link to="/register" className="text-blue-600 hover:underline">
                                                Sign Up
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Image Section */}
                    <div className="hidden lg:block lg:w-1/2 bg-blue-50 p-12">
                        <div className="h-full rounded-3xl overflow-hidden relative">
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-blue-600/20" />
                            
                            {/* Text Overlay */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-12">
                                <h2 className="text-4xl font-bold text-white mb-4">
                                    Exciting opportunities are just a step away. Login now!
                                </h2>
                            </div>

                            {/* Background Image */}
                            <img
                                src="https://images.unsplash.com/photo-1529539795054-3c162aab037a?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bG9naW58ZW58MHx8MHx8fDA%3D"
                                alt="Professional woman"
                                className="w-full h-full object-cover"
                                loading="lazy" // Optimized for faster loading
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Login;
