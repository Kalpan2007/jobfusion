import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseIcon, Eye, EyeOff } from "lucide-react";
import ModernLoader from "../components/Loader"; // Import the loader

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

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

        const userData = {
            email: formData.email,
            password: formData.password,
        };

        try {
            const response = await fetch("https://jobfusion.onrender.com/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", formData.email);
                navigate("/home");
            } else {
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false); // Hide loader
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

                            <h1 className="text-3xl font-bold mb-2">LOGIN</h1>

                            {error && <div className="mb-4 text-red-600">{error}</div>}

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

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Login Now
                                </button>
                            </form>

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
