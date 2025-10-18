import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";

const AddContest = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [problems, setProblems] = useState([]);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await axiosInstance.get("/problems");
        setAvailableProblems(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load problems");
      }
    }
    fetchProblems();
  }, []);

  const handleAddProblem = (problemId) => {
    if (problems.find((p) => p.problem === problemId)) return;
    setProblems([...problems, { problem: problemId, points: 500 }]);
  };

  const handleRemoveProblem = (problemId) => {
    setProblems(problems.filter((p) => p.problem !== problemId));
  };

  const handlePointsChange = (problemId, points) => {
    setProblems(
      problems.map((p) =>
        p.problem === problemId ? { ...p, points: Number(points) } : p
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (problems.length < 3) {
      setMessage("At least 3 problems are required");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setMessage("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/contests/create", {
        title,
        description,
        startTime,
        endTime,
        problems,
      });
      setMessage("Contest created successfully!");
      setTimeout(() => navigate("/admin/manage-contests"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to create contest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-white">Add Contest</h1>

      {message && (
        <p
          className={`mb-4 font-medium ${
            message.includes("successfully") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-[#1f1f1f] p-6 rounded-2xl space-y-5 shadow-lg"
      >
        {/* Title */}
        <div>
          <label className="block text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="4"
          />
        </div>

        {/* Start / End Time */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-gray-300 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-1/2">
            <label className="block text-gray-300 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Problems Section */}
        <div>
          <label className="block text-gray-300 mb-2">Select Problems</label>
          <div className="max-h-64 overflow-y-auto border border-gray-600 p-3 rounded bg-[#2a2a2a] space-y-2">
            {availableProblems.map((p) => {
              const selected = problems.find((pr) => pr.problem === p._id);
              return (
                <div
                  key={p._id}
                  className="flex justify-between items-center border-b border-gray-700 pb-2"
                >
                  <span className="text-white">{p.title}</span>
                  {selected ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={selected.points}
                        min={0}
                        onChange={(e) =>
                          handlePointsChange(p._id, e.target.value)
                        }
                        className="w-20 p-1 rounded bg-[#1f1f1f] text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProblem(p._id)}
                        className="px-3 py-1 rounded bg-gray-700 text-white text-sm hover:bg-gray-600 focus:ring-2 focus:ring-blue-500"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddProblem(p._id)}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Contest"}
        </button>
      </form>
    </div>
  );
};

export default AddContest;
