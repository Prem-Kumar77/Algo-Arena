import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // reset previous errors

    try {
      const response = await axiosInstance.post("/auth/signup", form);

      if (response.status === 201) {
        // Store the JWT token in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        navigate("/problems"); // successful signup
      }
    } catch (err) {
      const data = err.response?.data;

      // Handle errors array safely
      const firstError =
        Array.isArray(data?.errors) && data.errors.length > 0
          ? data.errors[0]
          : null;

      setError(firstError || data?.msg || data?.message || "Sign up failed");

      console.error("Signup error:", data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render error messages safely
  const renderError = (field) => {
    if (!error) return null;

    if (typeof error === "object" && error.path === field) {
      return (
        <p className="flex items-center text-red-500 text-sm mt-1">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M12 5.5a6.5 6.5 0 106.5 6.5A6.51 6.51 0 0012 5.5z"
            />
          </svg>
          {error.msg}
        </p>
      );
    }

    // If error is a string, display generic message
    if (typeof error === "string") {
      return <p className="text-red-500 text-sm mt-1">{error}</p>;
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-[#141414]">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-[#1e1e1e] p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            Create Account
          </h2>
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="px-4 py-2 bg-[#2e2e2e] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {renderError("username")}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-2 bg-[#2e2e2e] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {renderError("email")}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="px-4 py-2 bg-[#2e2e2e] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {renderError("password")}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 transition duration-200 text-white py-2 rounded-lg"
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
