import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";

const formatForInput = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const tzOffset = d.getTimezoneOffset() * 60000; // in ms
  const localISOTime = new Date(d - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
};

const EditContest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [allProblems, setAllProblems] = useState([]); // All available problems
  const [contestData, setContestData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    problems: [], // [{ problemId, title, points }]
  });

  // Helper to safely extract _id
  const getId = (idField) =>
    idField?._id ? getId(idField._id) : idField?.$oid || idField;

  // Fetch contest and all problems
  useEffect(() => {
    async function fetchData() {
      try {
        const [contestRes, problemsRes] = await Promise.all([
          axiosInstance.get(`/contests/${id}`),
          axiosInstance.get("/problems"),
        ]);

        const contest = contestRes.data.contest;

        const allProblemsMapped = (problemsRes.data || []).map((p) => ({
          ...p,
          _id: getId(p._id),
        }));

        const contestProblems = (contest.problems || []).map((p) => ({
          problemId: getId(p.problem?._id),
          title: p.problem?.title || "",
          points: p.points,
        }));

        setAllProblems(allProblemsMapped);
        setContestData({
          title: contest.title || "",
          description: contest.description || "",
          startTime: formatForInput(contest.startTime),
          endTime: formatForInput(contest.endTime),
          problems: contestProblems,
        });
      } catch (err) {
        console.error(err);
        setMessage("Failed to load contest or problems");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContestData((prev) => ({ ...prev, [name]: value }));
  };

  // Update points for a problem
  const handleProblemChange = (index, field, value) => {
    const updated = [...contestData.problems];
    updated[index][field] = field === "points" ? Number(value) : value;
    setContestData((prev) => ({ ...prev, problems: updated }));
  };

  // Remove a problem
  const removeProblem = (index) => {
    const updated = [...contestData.problems];
    updated.splice(index, 1);
    setContestData((prev) => ({ ...prev, problems: updated }));
  };

  // Add a problem
  const addProblem = (problem) => {
    if (!problem?._id) return;
    if (contestData.problems.some((p) => p.problemId === problem._id)) return;
    setContestData((prev) => ({
      ...prev,
      problems: [
        ...prev.problems,
        { problemId: problem._id, title: problem.title, points: 500 },
      ],
    }));
  };

  // Submit contest update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (contestData.problems.length < 3) {
      setMessage("At least 3 problems are required");
      return;
    }

    if (new Date(contestData.startTime) >= new Date(contestData.endTime)) {
      setMessage("End time must be after start time");
      return;
    }

    if (contestData.problems.some((p) => !p.problemId)) {
      setMessage("One or more selected problems are invalid");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await axiosInstance.patch(`/contests/${id}`, {
        title: contestData.title,
        description: contestData.description,
        startTime: contestData.startTime,
        endTime: contestData.endTime,
        problems: contestData.problems.map((p) => ({
          problem: p.problemId,
          points: p.points,
        })),
      });
      navigate("/admin/manage-contests");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to update contest");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <p className="text-gray-300 text-center mt-8">Loading contest data...</p>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#1f1f1f] rounded-2xl shadow-lg mt-6 text-white">
      <h1 className="text-2xl font-semibold mb-6">Edit Contest</h1>
      {message && <p className="text-red-400 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-gray-300 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={contestData.title}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-500 bg-[#2a2a2a] text-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            value={contestData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 rounded border border-gray-500 bg-[#2a2a2a] text-white"
          />
        </div>

        {/* Start/End Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={contestData.startTime}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-500 bg-[#2a2a2a] text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={contestData.endTime}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-500 bg-[#2a2a2a] text-white"
              required
            />
          </div>
        </div>

        {/* Problems */}
        <div>
          <h2 className="text-white font-medium mb-2">Select Problems</h2>
          {allProblems.length === 0 ? (
            <p className="text-gray-400">Loading problems...</p>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-500 p-2 rounded bg-[#2b2b2b]">
              {allProblems.map((prob) => {
                const existingIndex = contestData.problems.findIndex(
                  (p) => p.problemId === prob._id
                );
                const existing =
                  existingIndex !== -1
                    ? contestData.problems[existingIndex]
                    : null;

                return (
                  <div
                    key={prob._id}
                    className="flex justify-between items-center p-1 border-b border-gray-700"
                  >
                    <span className="text-white">{prob.title}</span>

                    {existing ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={existing.points}
                          min={0}
                          onChange={(e) =>
                            handleProblemChange(
                              existingIndex,
                              "points",
                              e.target.value
                            )
                          }
                          className="w-16 p-1 rounded border border-gray-500 bg-[#1f1f1f] text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeProblem(existingIndex)}
                          className="px-2 py-1 text-sm bg-red-600 rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addProblem(prob)}
                        className="px-2 py-1 text-sm bg-green-600 rounded hover:bg-green-700"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 mt-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Updating..." : "Update Contest"}
        </button>
      </form>
    </div>
  );
};

export default EditContest;
