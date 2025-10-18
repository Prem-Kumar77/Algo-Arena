import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash } from "lucide-react";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

const ManageContests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axiosInstance.get("/contests");
        const sorted = res.data.sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime)
        );
        setContests(sorted);
      } catch (err) {
        console.error(err);
        setError("Failed to load contests");
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contest?"))
      return;

    try {
      await axiosInstance.delete(`/contests/${id}`);
      setContests((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete contest.");
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Manage Contests</h1>
          <button
            onClick={() => navigate("/admin/add-contest")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition duration-200"
          >
            <Plus size={18} />
            Add Contest
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
        ) : contests.length === 0 ? (
          <p className="text-gray-400">No contests found.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1f1f1f] text-gray-300">
                <tr>
                  <th className="px-6 py-3 border-b border-gray-800">Title</th>
                  <th className="px-6 py-3 border-b border-gray-800">
                    Start Time
                  </th>
                  <th className="px-6 py-3 border-b border-gray-800">
                    End Time
                  </th>
                  <th className="px-6 py-3 border-b border-gray-800">
                    Participants
                  </th>
                  <th className="px-6 py-3 border-b border-gray-800 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {contests.map((c) => {
                  const now = new Date();
                  const isPast = new Date(c.endTime) < now;

                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-[#1c1c1c] transition duration-150"
                    >
                      <td className="px-6 py-4 border-b border-gray-800">
                        {c.title}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-800">
                        {format(new Date(c.startTime), "dd MMM yyyy, HH:mm")}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-800">
                        {format(new Date(c.endTime), "dd MMM yyyy, HH:mm")}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-800">
                        {c.participants || 0}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-800 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() =>
                              navigate(`/admin/edit-contest/${c._id}`)
                            }
                            className={`text-blue-400 hover:text-blue-500 transition ${
                              isPast ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={isPast}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className={`text-red-400 hover:text-red-500 transition ${
                              isPast ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={isPast}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageContests;
