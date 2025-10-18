import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCode,
  FaRocket,
  FaTrophy,
  FaChartLine,
  FaRobot,
  FaComments,
  FaStar,
  FaBook,
} from "react-icons/fa";
import axiosInstance from "@/utils/axios";

const HomePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/auth/check");
        setUser(response.data.message); // assume response.data has user info like {name, profilePicture}
      } catch (error) {
        console.log("User not logged in", error);
        setUser(null);
      }
    }
    fetchData();
  }, []);

  const PROJECT_NAME = "AlgoArena";

  const features = [
    {
      icon: <FaCode className="text-indigo-400 text-3xl" />,
      title: "Practice Problems",
      desc: "Challenge yourself with a wide range of problems in algorithms, data structures, and more.",
    },
    {
      icon: <FaTrophy className="text-yellow-400 text-3xl" />,
      title: "Contests",
      desc: "Participate in live contests and climb the leaderboard.",
    },
    {
      icon: <FaChartLine className="text-green-400 text-3xl" />,
      title: "Leaderboards",
      desc: "Track your progress and see how you rank among other coders.",
    },
    {
      icon: <FaBook className="text-purple-400 text-3xl" />,
      title: "Editorials & Explanations",
      desc: "Read detailed editorials for every problem and master efficient approaches.",
    },
    {
      icon: <FaComments className="text-orange-400 text-3xl" />,
      title: "Discussions",
      desc: "Engage with the community, ask questions, and share solutions.",
    },
    {
      icon: <FaChartLine className="text-cyan-400 text-3xl" />,
      title: "Progress Tracking",
      desc: "Monitor your learning journey with detailed analytics and personalized recommendations.",
    },
  ];

  return (
    <div className="bg-[#141414] min-h-screen text-gray-200">
      {/* Hero Section */}
      <section className="bg-gray-850 relative overflow-hidden py-3 pt-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-indigo-400">{PROJECT_NAME}</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Sharpen your coding skills, compete in contests, and join a vibrant
            developer community.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {!user && (
              <Link
                to="/signup"
                className="bg-indigo-500 hover:bg-indigo-600 transition-colors px-6 py-3 rounded font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <FaRocket /> Get Started
              </Link>
            )}
            <Link
              to="/problems"
              className="bg-gray-700 hover:bg-gray-600 transition-colors px-6 py-3 rounded font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <FaCode /> Practice{" "}
              <span className="hidden md:block">Problems</span>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      {/* <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4 flex items-center justify-center gap-2">
            <FaStar className="text-yellow-400" /> About {PROJECT_NAME}
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            CodeArena is your all-in-one platform to practice coding, compete in
            contests, and grow as a developer. Whether you're a beginner or a
            pro, you'll find challenges, community, and tools to help you
            succeed.
          </p>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="bg-gray-850 py-3 my-3">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-[#272626] p-6 rounded-lg shadow-md hover:bg-[#3a3a3a] transition-colors duration-300"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-6xl mx-auto px-6 text-center py-3 pb-10">
        {!user ? (
          <>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Ready to begin?
            </h2>
            <p className="text-gray-300 mb-6">
              Sign up now and start your journey to becoming a better
              programmer!
            </p>
            <Link
              to="/signup"
              className="bg-indigo-500 hover:bg-indigo-600 transition-colors px-8 py-3 rounded font-semibold flex items-center justify-center gap-2"
            >
              <FaRocket /> Sign Up
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Welcome back, {user.username}!
            </h2>
            <p className="text-gray-300 mb-6">
              Ready to continue your coding journey? Jump back into practice or
              explore new challenges.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/problems"
                className="bg-indigo-500 hover:bg-indigo-600 transition-colors px-6 py-3 rounded font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <FaCode /> Continue Practice
              </Link>
              <Link
                to="/contests"
                className="bg-gray-700 hover:bg-gray-600 transition-colors px-6 py-3 rounded font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <FaTrophy /> Join Contests
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default HomePage;
