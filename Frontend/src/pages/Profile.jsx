import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import Navbar from "@/components/Navbar";
import { Camera, Pencil, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const difficultyColors = {
  Easy: { light: "#a7f3d0", dark: "#22c55e" },
  Medium: { light: "#fde68a", dark: "#eab308" },
  Hard: { light: "#fca5a5", dark: "#ef4444" },
};

const difficultyColorsText = {
  Easy: "text-green-500",
  Medium: "text-yellow-500",
  Hard: "text-red-500",
};

const formatDateDDMMYYYY_HHMM = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const GAP_DEG = 8;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editableProfile, setEditableProfile] = useState({});
  const [editingField, setEditingField] = useState(null); // "username" or "email"
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/users/profile");
        setProfile(response.data.user);
        console.log(response.data.user);
        setEditableProfile(response.data.user);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load profile");
      }
    };
    fetchProfile();
  }, [updating]);

  if (!profile) return <p className="text-center mt-10">Loading profile...</p>;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
      setPreview(reader.result);
      setEditingField(null);
    };
    reader.readAsDataURL(file);
  };

  const startEditing = (field) => {
    setEditingField(field);
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleChange = (field, value) => {
    setEditableProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSave = async () => {
    setUpdating(true);
    setErrors({});
    setMessage("");

    try {
      const res = await axiosInstance.patch("/users/profile", {
        username: editableProfile.username,
        email: editableProfile.email,
        profilePicture: profilePicture || editableProfile.profilePicture,
      });

      setProfile(res.data.user);
      setEditableProfile(res.data.user);
      setPreview(null);
      setProfilePicture(null);
      setEditingField(null);
      setMessage("Profile updated successfully!");
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      console.error(err);
      const newErrors = {};
      let handled = false;

      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((error) => {
          if (["username", "email"].includes(error.path)) {
            newErrors[error.path] = error.msg;
            handled = true;
          }
        });
        setErrors(newErrors);
      }

      if (!handled) {
        setMessage("Failed to update profile");
      }
    } finally {
      setUpdating(false);
    }
  };

  const { solvedCounts = {}, stats = {}, solved = [] } = profile || {};

  const radius = 70;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const START_ROTATION = 90;

  const totalEasy = stats?.easy || 0;
  const totalMedium = stats?.medium || 0;
  const totalHard = stats?.hard || 0;
  const totalProblems = totalEasy + totalMedium + totalHard;

  const easyArc = (totalEasy / totalProblems) * circumference;
  const mediumArc = (totalMedium / totalProblems) * circumference;
  const hardArc = (totalHard / totalProblems) * circumference;
  const gap = (GAP_DEG / 360) * circumference;

  const easyArcAdjusted = easyArc - gap;
  const mediumArcAdjusted = mediumArc - gap;
  const hardArcAdjusted = hardArc - gap;

  const easySolved = totalEasy
    ? (solvedCounts.Easy / totalEasy) * easyArcAdjusted
    : 0;
  const mediumSolved = totalMedium
    ? (solvedCounts.Medium / totalMedium) * mediumArcAdjusted
    : 0;
  const hardSolved = totalHard
    ? (solvedCounts.Hard / totalHard) * hardArcAdjusted
    : 0;

  let offset = circumference;
  const totalSolved =
    (solvedCounts.Easy || 0) +
    (solvedCounts.Medium || 0) +
    (solvedCounts.Hard || 0);

  const isEditing = editingField || profilePicture;

  return (
    <div className="min-h-screen text-white bg-[#141414]">
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg relative">
          {/* Profile Picture */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <img
              src={preview || editableProfile.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-gray-700 object-cover"
            />
            <label className="absolute bottom-1 right-1 bg-black/70 p-1.5 rounded-full cursor-pointer hover:bg-black flex items-center justify-center">
              {updating ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                <>
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </>
              )}
            </label>
          </div>

          {/* Profile Details */}
          <div className="flex flex-col flex-grow gap-2 w-full">
            {/* Username */}
            <div className="flex flex-col w-full">
              <div className="flex items-center w-full">
                <input
                  type="text"
                  value={editableProfile.username}
                  readOnly={editingField !== "username"}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className={`bg-transparent border-b ${
                    editingField === "username"
                      ? "border-gray-600 focus:border-blue-500"
                      : "border-transparent"
                  } outline-none text-xl font-semibold p-0 m-0 flex-grow`}
                  style={{ lineHeight: "1" }}
                />
                <Pencil
                  size={16}
                  className="text-gray-400 cursor-pointer ml-1"
                  onClick={() => startEditing("username")}
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="email"
                  value={editableProfile.email}
                  readOnly={editingField !== "email"}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`bg-transparent border-b ${
                    editingField === "email"
                      ? "border-gray-600 focus:border-blue-500"
                      : "border-transparent"
                  } outline-none text-gray-300 flex-grow`}
                />
                <Pencil
                  size={16}
                  className="text-gray-400 cursor-pointer"
                  onClick={() => startEditing("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <span className="inline-block mt-1 px-3 py-1 text-sm bg-gray-600 rounded-full w-fit">
              {editableProfile.role}
            </span>
          </div>

          {/* Save Button */}
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={updating}
              className="absolute top-4 right-4 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg disabled:opacity-50 sm:static sm:self-start"
            >
              <Save size={14} /> Save
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-center font-medium ${
              message.includes("successfully")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        {/* Stats & Circle */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 px-3 py-3 rounded-2xl border border-gray-700 justify-around">
          <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] flex-shrink-0">
            <svg width={300} height={300}>
              {/* Easy */}
              <circle
                cx={90}
                cy={90}
                r={radius}
                stroke={difficultyColors.Easy.light}
                strokeWidth={stroke}
                fill="transparent"
                strokeDasharray={`${easyArcAdjusted} ${circumference - easyArcAdjusted}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(${START_ROTATION} 90 90)`}
              />
              <circle
                cx={90}
                cy={90}
                r={radius}
                stroke={difficultyColors.Easy.dark}
                strokeWidth={stroke}
                fill="transparent"
                strokeDasharray={`${easySolved} ${circumference - easySolved}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(${START_ROTATION} 90 90)`}
              />
              {(offset -= easyArc)}
              {/* Medium */}
              <circle
                cx={90}
                cy={90}
                r={radius}
                stroke={difficultyColors.Medium.light}
                strokeWidth={stroke}
                fill="transparent"
                strokeDasharray={`${mediumArcAdjusted} ${circumference - mediumArcAdjusted}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(${START_ROTATION} 90 90)`}
              />
              <circle
                cx={90}
                cy={90}
                r={radius}
                stroke={difficultyColors.Medium.dark}
                strokeWidth={stroke}
                fill="transparent"
                strokeDasharray={`${mediumSolved} ${circumference - mediumSolved}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(${START_ROTATION} 90 90)`}
              />
              {(offset -= mediumArc)}
              {/* Hard */}
              <circle
                cx={90}
                cy={90}
                r={radius}
                stroke={difficultyColors.Hard.light}
                strokeWidth={stroke}
                fill="transparent"
                strokeDasharray={`${hardArcAdjusted} ${circumference - hardArcAdjusted}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(${START_ROTATION} 90 90)`}
              />
              <circle
                cx={90}
                cy={90}
                r={radius}
                stroke={difficultyColors.Hard.dark}
                strokeWidth={stroke}
                fill="transparent"
                strokeDasharray={`${hardSolved} ${circumference - hardSolved}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(${START_ROTATION} 90 90)`}
              />
            </svg>

            {/* Center text */}
            <div className="absolute top-[55px] left-[55px] w-[70px] text-center">
              <p className="text-xl sm:text-2xl font-semibold">
                {totalSolved}/{stats?.total}
              </p>
              <p className="text-sm text-gray-400">Solved</p>
            </div>
          </div>

          {/* Stats Labels */}
          <div className="flex w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] flex-shrink-0 items-center justify-center">
            <div className="flex flex-col gap-2 ">
              {["Easy", "Medium", "Hard"].map((level) => (
                <div
                  key={level}
                  className="flex items-center gap-2 text-sm sm:text-base"
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: difficultyColors[level].dark }}
                  />
                  <span className="text-white">
                    {level}: {solvedCounts[level] || 0}/
                    {stats?.[level.toLowerCase()] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Solved Problems List */}
        <div className="border border-gray-700 p-4 sm:p-6 rounded-2xl max-h-[400px] overflow-y-auto">
          <h2 className="text-xl font-semibold mt-2 mb-3">Solved Problems</h2>
          {solved.length === 0 ? (
            <p className="text-gray-400">No problems solved yet.</p>
          ) : (
            <div className="space-y-3">
              {solved.map((problem, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start sm:items-center border border-gray-700 p-3 rounded-xl gap-2"
                >
                  <div>
                    <p className="font-medium">{problem.title}</p>
                    <p
                      className={`text-sm ${
                        difficultyColorsText[problem.difficulty] ||
                        "text-gray-400"
                      }`}
                    >
                      {problem.difficulty}
                    </p>
                  </div>
                  <span className="inline-block text-gray-300 text-sm px-2 py-0.5 rounded-full font-mono">
                    {formatDateDDMMYYYY_HHMM(problem.solvedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
