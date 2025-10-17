import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";
import Navbar from "@/components/Navbar";
import { Trophy, FileText, Settings } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    contests: 0,
    problems: 0,
    submissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/auth/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Users",
      icon: <></>, // Optionally remove icon if desired
      value: stats.users,
      color: "bg-blue-950/40 border-blue-800",
    },
    {
      title: "Total Contests",
      icon: <Trophy className="text-yellow-400 w-8 h-8" />,
      value: stats.contests,
      color: "bg-yellow-950/40 border-yellow-800",
    },
    {
      title: "Total Problems",
      icon: <FileText className="text-green-400 w-8 h-8" />,
      value: stats.problems,
      color: "bg-green-950/40 border-green-800",
    },
    {
      title: "Total Submissions",
      icon: <Settings className="text-purple-400 w-8 h-8" />,
      value: stats.submissions,
      color: "bg-purple-950/40 border-purple-800",
    },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold mb-8">Admin Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <svg
              className="animate-spin h-8 w-8 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {cards.map((card, idx) => (
                <div
                  key={idx}
                  className={`p-6 border rounded-2xl flex items-center justify-between ${card.color} hover:scale-[1.03] transition-transform duration-200`}
                >
                  <div>
                    <h2 className="text-lg font-medium text-gray-300">
                      {card.title}
                    </h2>
                    <p className="text-3xl font-semibold mt-2">{card.value}</p>
                  </div>
                  {card.icon}
                </div>
              ))}
            </div>

            {/* Management Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => navigate("/admin/manage-contests")}
                className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl border border-gray-700 transition duration-200 text-left"
              >
                <h3 className="text-xl font-semibold mb-2">
                  🏆 Manage Contests
                </h3>
                <p className="text-gray-400 text-sm">
                  Create, edit, and delete contests.
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/manage-problems")}
                className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl border border-gray-700 transition duration-200 text-left"
              >
                <h3 className="text-xl font-semibold mb-2">
                  🧩 Manage Problems
                </h3>
                <p className="text-gray-400 text-sm">
                  Add and maintain coding problems.
                </p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
