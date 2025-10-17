import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar"; // adjust path if needed

const ContestDetails = () => {
  const { contestId } = useParams();
  const [contest, setContest] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`contests/${contestId}`);
        setContest(response.data.contest); // fixed: access nested contest
        setIsRegistered(response.data.isRegistered);
      } catch (err) {
        console.error("Error fetching contest:", err);
        setError("Failed to load contest details.");
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [contestId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-gray-400 text-lg">Loading contest details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!contest)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-gray-400 text-lg">No contest found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Contest Title */}
        <h1 className="text-2xl font-bold text-white mb-3">{contest.title}</h1>

        {/* Contest Description */}
        {contest.description && (
          <p className="text-gray-300 text-lg mb-6">{contest.description}</p>
        )}

        {/* Contest Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300 mb-8">
          <p>
            <span className="font-semibold text-white">Start:</span>{" "}
            {new Date(contest.startTime).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold text-white">End:</span>{" "}
            {new Date(contest.endTime).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold text-white">Problems:</span>{" "}
            {contest.problems?.length || 0}
          </p>
          <p>
            <span className="font-semibold text-white">Participants:</span>{" "}
            {contest.participants?.length || 0}
          </p>
        </div>

        {/* Leaderboard Link */}
        <div className="mb-8">
          <Link
            to={`/contests/${contestId}/leaderboard`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition"
          >
            View Leaderboard
          </Link>
        </div>

        {/* Problems List */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Problems</h2>
          <ul className="space-y-2">
            {contest.problems?.map((p) => {
              let linkTo = "#";
              if (contest.computedStatus === "completed") {
                linkTo = `/problem/${p.problem._id}` || "#";
              } else if (contest.computedStatus === "ongoing") {
                linkTo =
                  `/contests/${contest._id}/problem/${p.problem._id}` || "#";
              }

              const problemContent = (
                <div className="flex justify-between items-center p-4 rounded-lg shadow-md border border-gray-700 hover:border-green-500 transition">
                  <span
                    className={
                      contest.computedStatus === "completed" ||
                      contest.computedStatus === "ongoing"
                        ? "text-gray-200 font-medium"
                        : "text-gray-400 font-medium"
                    }
                  >
                    {p.problem?.title || "Unknown Problem"}
                  </span>
                  <span className="text-green-400 font-semibold">
                    {p.points} pts
                  </span>
                </div>
              );

              return linkTo === "#" ? (
                <li key={p._id}>{problemContent}</li>
              ) : (
                <li key={p._id}>
                  <Link to={linkTo} className="block">
                    {problemContent}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContestDetails;
