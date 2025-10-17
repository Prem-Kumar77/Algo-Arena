import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";

const AddContest = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [problems, setProblems] = useState([]); // Selected problems [{problem: id, points}]
  const [availableProblems, setAvailableProblems] = useState([]); // fetched from server
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
      const res = await axiosInstance.post("/contests/create", {
        title,
        description,
        startTime,
        endTime,
        problems,
      });
      setMessage("Contest created successfully!");
      navigate("/admin/manage-contests");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to create contest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#1f1f1f] rounded-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-white">Add Contest</h1>
      {message && <p className="text-red-400">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded border border-gray-500 bg-[#2b2b2b] text-white"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded border border-gray-500 bg-[#2b2b2b] text-white"
        />
        <div className="flex gap-4">
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-1/2 p-2 rounded border border-gray-500 bg-[#2b2b2b] text-white"
            required
          />
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-1/2 p-2 rounded border border-gray-500 bg-[#2b2b2b] text-white"
            required
          />
        </div>

        <div>
          <h2 className="text-white font-medium mb-2">Select Problems</h2>
          <div className="max-h-64 overflow-y-auto border border-gray-500 p-2 rounded bg-[#2b2b2b]">
            {availableProblems.map((p) => (
              <div
                key={p._id}
                className="flex justify-between items-center p-1 border-b border-gray-700"
              >
                <span className="text-white">{p.title}</span>
                {problems.find((pr) => pr.problem === p._id) ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={problems.find((pr) => pr.problem === p._id).points}
                      min={0}
                      onChange={(e) =>
                        handlePointsChange(p._id, e.target.value)
                      }
                      className="w-16 p-1 rounded border border-gray-500 bg-[#1f1f1f] text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProblem(p._id)}
                      className="px-2 py-1 text-sm bg-red-600 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddProblem(p._id)}
                    className="px-2 py-1 text-sm bg-green-600 rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Contest"}
        </button>
      </form>
    </div>
  );
};

export default AddContest;
