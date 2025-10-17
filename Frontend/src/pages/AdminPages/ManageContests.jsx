import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";
import { format } from "date-fns";
import { Pencil, Trash } from "lucide-react"; // Using lucide-react icons
import Navbar from "@/components/Navbar";

const ManageContests = () => {
  const [contests, setContests] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchContests() {
      try {
        const res = await axiosInstance.get("/contests");
        const sorted = res.data.sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime)
        );
        setContests(sorted);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load contests");
      } finally {
        setLoading(false);
      }
    }
    fetchContests();
  }, []);

  const now = new Date();

  const upcoming = contests.filter((c) => new Date(c.startTime) > now);
  const ongoing = contests.filter(
    (c) => new Date(c.startTime) <= now && new Date(c.endTime) >= now
  );
  const past = contests.filter((c) => new Date(c.endTime) < now);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contest?"))
      return;

    try {
      await axiosInstance.delete(`/contests/${id}`);
      setContests(contests.filter((c) => c._id !== id));
      setMessage("Contest deleted successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete contest");
    }
  };

  const renderContests = (list) => {
    return list.map((contest) => {
      const isExpanded = expanded === contest._id;
      const isPast = new Date(contest.endTime) < now;

      return (
        <div
          key={contest._id}
          className="border border-gray-500 p-4 rounded-2xl shadow-none cursor-pointer bg-[#1f1f1f]"
        >
          <div
            onClick={() => setExpanded(isExpanded ? null : contest._id)}
            className="flex justify-between items-center"
          >
            <h2 className="text-white font-semibold text-lg">
              {contest.title}
            </h2>
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {isExpanded && (
            <div className="mt-2 space-y-2">
              <p className="text-gray-400 text-sm">{contest.description}</p>
              <p className="text-gray-300 text-sm">
                Start:{" "}
                {format(new Date(contest.startTime), "dd MMM yyyy, HH:mm")} |
                End: {format(new Date(contest.endTime), "dd MMM yyyy, HH:mm")}
              </p>
              <p className="text-gray-300 text-sm">
                Participants: {contest.participants} | Problems:{" "}
                {contest.problems.length}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => navigate(`/admin/edit-contest/${contest._id}`)}
                  className={`p-2 rounded border border-gray-500 text-gray-300 flex items-center justify-center ${
                    isPast
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:text-white hover:border-white"
                  }`}
                  disabled={isPast}
                  title="Edit Contest"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => handleDelete(contest._id)}
                  className={`p-2 rounded border border-gray-500 text-gray-300 flex items-center justify-center ${
                    isPast
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:text-white hover:border-white"
                  }`}
                  disabled={isPast}
                  title="Delete Contest"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col bg-[#141414]">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6 flex-1 w-full bg-[#141414]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Manage Contests</h1>
          <button
            onClick={() => navigate("/admin/add-contest")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Contest
          </button>
        </div>

        {message && <p className="text-red-400 mb-4">{message}</p>}

        {loading ? (
          <p className="text-gray-300">Loading contests...</p>
        ) : contests.length === 0 ? (
          <p className="text-gray-300">No contests available.</p>
        ) : (
          <div className="space-y-6">
            {ongoing.length > 0 && (
              <div>
                <h2 className="text-white font-medium mb-2">Ongoing</h2>
                <div className="space-y-3">{renderContests(ongoing)}</div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <h2 className="text-white font-medium mb-2">Upcoming</h2>
                <div className="space-y-3">{renderContests(upcoming)}</div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-white font-medium mb-2">Past</h2>
                <div className="space-y-3">{renderContests(past)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageContests;
