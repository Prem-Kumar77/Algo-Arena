import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const ManageProblems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axiosInstance.get("/problems/");
        setProblems(res.data);
      } catch (err) {
        console.error("Failed to fetch problems:", err);
        setError("Failed to load problems.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?"))
      return;
    try {
      await axiosInstance.delete(`/problems/${id}`);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete problem:", err);
      alert("Failed to delete problem.");
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Manage Problems</h1>
          <button
            onClick={() => navigate("/admin/add-problem")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition duration-200"
          >
            <Plus size={18} />
            Add Problem
          </button>
        </div>

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
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : problems.length === 0 ? (
          <p className="text-gray-400">No problems found.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1f1f1f] text-gray-300">
                <tr>
                  <th className="px-6 py-3 border-b border-gray-800">Title</th>
                  <th className="px-6 py-3 border-b border-gray-800">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 border-b border-gray-800">Tags</th>
                  <th className="px-6 py-3 border-b border-gray-800 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-[#1c1c1c] transition duration-150"
                  >
                    <td className="px-6 py-4 border-b border-gray-800">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-800 capitalize">
                      <span>{p.difficulty}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-800 text-gray-400">
                      {p.tags?.join(", ") || "—"}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-800 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() =>
                            navigate(`/admin/edit-problem/${p._id}`)
                          }
                          className="text-blue-400 hover:text-blue-500 transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProblems;
