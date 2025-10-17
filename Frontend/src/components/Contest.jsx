import { useState, useEffect } from "react";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { useNavigate } from "react-router-dom";

const Contest = ({ contest, type, user }) => {
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(contest?.isRegistered || false);

  // sync local state if parent updates props
  useEffect(() => {
    setRegistered(contest?.isRegistered || false);
  }, [contest?.isRegistered]);

  const handleJoinContest = async (contestId) => {
    if (registered) return;

    try {
      if (!user) {
        alert("Please log in to join the contest.");
        return;
      }

      await axiosInstance.post(`contests/${contestId}/join`);

      // Update local state
      setRegistered(true);

      // Update parent state
      if (onRegister) {
        onRegister({ ...contest, isRegistered: true });
      }

      alert("Successfully joined the contest!");
    } catch (error) {
      console.error("Error joining contest:", error);
      alert("Failed to join contest.");
    }
  };

  const handleClick = () => {
    if (type === "ongoing" || type === "past") {
      navigate(`/contests/${contest._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${
        type === "upcoming"
          ? "bg-gray-700 border-green-400"
          : type === "ongoing"
            ? "bg-gray-700 border-yellow-400"
            : "bg-gray-800 border-gray-600"
      } border-l-4 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow duration-300 max-w-5xl mx-auto`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
        <h3 className="text-lg sm:text-xl font-semibold text-white break-words">
          {contest.title}
        </h3>
        <span
          className={`mt-2 sm:mt-0 px-2 py-1 rounded-full text-xs sm:text-sm font-medium text-center ${
            type === "upcoming"
              ? "bg-green-500 text-white"
              : type === "ongoing"
                ? "bg-yellow-500 text-black"
                : "bg-gray-600 text-gray-200"
          }`}
        >
          {type === "upcoming"
            ? "Upcoming"
            : type === "ongoing"
              ? "Ongoing"
              : "Past"}
        </span>
      </div>

      {/* Description */}
      {contest.description && (
        <p className="text-gray-300 mb-2 text-sm sm:text-base">
          {contest.description}
        </p>
      )}

      {/* Info */}
      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-400 mb-3">
        <p>
          <span className="font-semibold">Start:</span>{" "}
          {dayjs(contest.startTime).format("DD MMM YYYY, HH:mm")}
        </p>
        <p>
          <span className="font-semibold">End:</span>{" "}
          {dayjs(contest.endTime).format("DD MMM YYYY, HH:mm")}
        </p>
        <p>
          <span className="font-semibold">
            {Array.isArray(contest.problems)
              ? contest.problems.length
              : contest.problems || 0}
          </span>{" "}
          problems
        </p>
        <p>
          <span className="font-semibold">{contest.participants || 0}</span>{" "}
          participants
        </p>
      </div>

      {/* Join / Registered Button */}
      {type === "upcoming" && (
        <button
          disabled={registered}
          className={`${
            registered ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"
          } text-white font-semibold px-3 py-1.5 rounded-md text-sm sm:text-base transition-colors duration-200`}
          onClick={() => handleJoinContest(contest._id)}
        >
          {contest.isRegistered || registered ? "Registered" : "Join Contest"}
        </button>
      )}
    </div>
  );
};

export default Contest;
