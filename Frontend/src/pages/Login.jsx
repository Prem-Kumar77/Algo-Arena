import { useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const response = await axiosInstance.post("auth/login", form);

      if (response.status === 200) {
        navigate("/problems"); // login success
      }
    } catch (err) {
      const data = err.response?.data;

      // Safely handle errors array
      const firstError =
        Array.isArray(data?.errors) && data.errors.length > 0
          ? data.errors[0]
          : null;

      // Set error state: object or string
      setError(firstError || data?.msg || data?.message || "Login failed");

      console.error("Login error:", data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to safely render error messages
  const renderError = (field) => {
    if (!error) return null;

    // If error is an object with 'path' and 'msg'
    if (typeof error === "object" && error.path === field) {
      return (
        <p className="text-red-500 text-sm flex items-center mt-1">
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

    // If error is a string, show generic error
    if (typeof error === "string") {
      return (
        <p className="text-red-500 text-sm flex items-center mt-1">{error}</p>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-[#141414]">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-[#1e1e1e] rounded-2xl shadow-lg w-full max-w-md p-8">
          <h2 className="font-bold text-2xl text-center text-white mb-6">
            Login
          </h2>
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg bg-[#2e2e2e] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {renderError("email")}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg bg-[#2e2e2e] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {renderError("password")}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-500 py-2 rounded-lg text-white hover:bg-indigo-600 transition duration-100"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-gray-400 text-center text-sm mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="hover:underline text-indigo-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
