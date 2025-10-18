import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";

const formatForInput = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 16);
};

const EditContest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [allProblems, setAllProblems] = useState([]);
  const [contestData, setContestData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    problems: [], // { problemId, title, points }
  });

  const getId = (idField) => {
    if (!idField) return null;
    if (typeof idField === "string") return idField;
    if (idField._id) return idField._id;
    if (idField.$oid) return idField.$oid;
    return null;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [contestRes, problemsRes] = await Promise.all([
          axiosInstance.get(`/contests/${id}`),
          axiosInstance.get("/problems"),
        ]);

        const allProblemsMapped = (problemsRes.data || []).map((p) => ({
          ...p,
          _id: getId(p._id),
        }));

        const contest = contestRes.data?.contest || {};
        const contestProblems = (contest.problems || []).map((p) => ({
          problemId: getId(p.problem?._id || p.problem),
          title: p.problem?.title || p.title || "Untitled",
          points: p.points || 500,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContestData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePointsChange = (problemId, points) => {
    setContestData((prev) => ({
      ...prev,
      problems: prev.problems.map((p) =>
        p.problemId === problemId ? { ...p, points: Number(points) } : p
      ),
    }));
  };

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

  const removeProblem = (problemId) => {
    setContestData((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p.problemId !== problemId),
    }));
  };

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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-white">Edit Contest</h1>

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
            name="title"
            value={contestData.title}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            rows="4"
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Start / End */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-gray-300 mb-1">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={contestData.startTime}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-300 mb-1">End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={contestData.endTime}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Problems */}
        <div>
          <label className="block text-gray-300 mb-2">Select Problems</label>
          <div className="max-h-64 overflow-y-auto border border-gray-600 p-3 rounded bg-[#2a2a2a] space-y-2">
            {allProblems.map((p) => {
              const selected = contestData.problems.find(
                (pr) => pr.problemId === p._id
              );
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
                        onClick={() => removeProblem(p._id)}
                        className="px-3 py-1 rounded bg-gray-700 text-white text-sm hover:bg-gray-600 focus:ring-2 focus:ring-blue-500"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addProblem(p)}
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
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 w-full"
        >
          {submitting ? "Updating..." : "Update Contest"}
        </button>
      </form>
    </div>
  );
};

export default EditContest;
