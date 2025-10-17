import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axios";

const Leaderboard = () => {
  const { contestId } = useParams();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(25); // entries per page
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contest details
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await axiosInstance.get(`/contests/${contestId}`);
        setContest(res.data.contest || res.data); // backend may send contest directly
      } catch (err) {
        console.error(err);
        setError("Failed to load contest details.");
      }
    };
    fetchContest();
  }, [contestId]);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/contests/${contestId}/leaderboard?page=${page}&limit=${limit}`
        );
        setLeaderboard(res.data.leaderboard || []);
        const totalEntries = res.data.leaderboardCount || res.data.total || 0;
        setTotalPages(Math.ceil(totalEntries / limit) || 1);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [contestId, page, limit]);

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#141414]">
        <p className="text-gray-400 text-lg">Loading leaderboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-[#141414]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!contest || leaderboard.length === 0)
    return (
      <div className="flex items-center justify-center h-screen bg-[#141414]">
        <p className="text-gray-400 text-lg">No leaderboard data found.</p>
      </div>
    );

  return (
    <div className="w-full bg-[#141414] min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-200">
          {contest.title} - Leaderboard
        </h1>

        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Total Score
                </th>
                {contest.problems?.map((p, index) => (
                  <th
                    key={p.problem._id}
                    className="px-4 py-3 text-center text-gray-300 font-medium"
                  >
                    Q{index + 1}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-[#222222] divide-y divide-gray-800">
              {leaderboard.map((user) => (
                <tr
                  key={user.username}
                  className="hover:bg-[#2a2a2a] transition-colors duration-200"
                >
                  <td className="px-4 py-3 text-gray-200 font-medium">
                    {user.rank}
                  </td>
                  <td className="px-4 py-3 text-gray-200">{user.username}</td>
                  <td className="px-4 py-3 text-gray-200">{user.totalScore}</td>

                  {contest.problems?.map((p) => {
                    const problemId = p.problem._id.toString();
                    const solved = user.problemsSolved?.find(
                      (ps) => ps.problem.toString() === problemId
                    );

                    return (
                      <td key={problemId} className="px-2 py-2 text-center">
                        <div
                          className={`px-2 py-1 rounded text-sm font-semibold ${
                            solved
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-800 text-gray-400"
                          }`}
                          title={`Max Points: ${p.points}`}
                        >
                          {solved ? solved.score : 0}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
