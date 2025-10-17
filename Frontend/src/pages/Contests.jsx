import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import Contest from "../components/Contest";
import Navbar from "@/components/Navbar";

const Contests = ({ currentUserId }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [user, setUser] = useState();

  // Fetch contests from API

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("contests/", {
          withCredentials: true,
        });
        // console.log(token);
        setContests(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Error fetching contests"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/auth/check");
        setUser(response.data); // assume response.data has user info like {name, profilePicture}
      } catch (error) {
        console.log("User not logged in", error);
        setUser(null);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return <div className="text-gray-400 p-6">Loading contests...</div>;
  if (error) return <div className="text-red-500 p-6">Error: {error}</div>;

  const now = dayjs();

  // Split contests into ongoing, upcoming, past
  const ongoingContests = contests
    .filter(
      (contest) =>
        dayjs(contest.startTime).isBefore(now) &&
        dayjs(contest.endTime).isAfter(now)
    )
    .sort((a, b) => dayjs(a.startTime) - dayjs(b.startTime));

  const upcomingContests = contests
    .filter((contest) => dayjs(contest.startTime).isAfter(now))
    .sort((a, b) => dayjs(a.startTime) - dayjs(b.startTime));

  const pastContests = contests
    .filter((contest) => dayjs(contest.endTime).isBefore(now))
    .sort((a, b) => dayjs(b.startTime) - dayjs(a.startTime));

  return (
    <div className="flex flex-col bg-[#141414]">
      <Navbar />
      <div className="flex w-full flex-grow justify-center">
        <div className="p-8 min-h-screen max-w-5xl flex-1">
          {/* Ongoing Contests */}
          {ongoingContests.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                Ongoing Contests
              </h2>
              {ongoingContests.map((contest) => (
                <Contest
                  key={contest._id}
                  contest={contest}
                  type="ongoing"
                  currentUserId={currentUserId}
                />
              ))}
            </>
          )}

          {/* Upcoming Contests */}
          {upcomingContests.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-white mt-10 mb-6 border-b border-gray-700 pb-2">
                Upcoming Contests
              </h2>
              {upcomingContests.map((contest) => (
                <Contest
                  key={contest._id}
                  contest={contest}
                  type="upcoming"
                  currentUserId={currentUserId}
                  user={user}
                />
              ))}
            </>
          )}

          {/* Past Contests */}
          {pastContests.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-white mt-10 mb-6 border-b border-gray-700 pb-2">
                Past Contests
              </h2>
              {pastContests.map((contest) => (
                <Contest
                  key={contest._id}
                  contest={contest}
                  type="past"
                  currentUserId={currentUserId}
                  onRegister={(updatedContest) => {
                    setContests((prev) =>
                      prev.map((c) =>
                        c._id === updatedContest._id ? updatedContest : c
                      )
                    );
                  }}
                />
              ))}
            </>
          )}

          {/* No contests */}
          {ongoingContests.length === 0 &&
            upcomingContests.length === 0 &&
            pastContests.length === 0 && (
              <p className="text-gray-400">No contests available</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Contests;
