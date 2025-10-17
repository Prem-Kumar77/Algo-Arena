import User from "../models/user.model.js";
import Submission from "../models/submission.model.js";
import Stats from "../models/stats.model.js";
import cloudinary from "../lib/cloudinary.js";

async function getUserProfile(req, res) {
  try {
    const { _id, username, email, role, profilePicture } = req.user;

    // Fetch all submissions for the user
    const submissions = await Submission.find({ user: _id })
      .populate("problem", "title difficulty")
      .sort({ createdAt: -1 }); // most recent first

    // Keep all submissions for display
    const allSubmissions = submissions
      .filter((sub) => sub.verdict === "Accepted")
      .map((sub) => ({
        submissionId: sub._id,
        problemId: sub.problem?._id,
        title: sub.problem?.title,
        difficulty: sub.problem?.difficulty,
        verdict: sub.verdict,
        solvedAt: sub.createdAt,
      }));

    // Count unique accepted problems per difficulty for progress
    const solvedCounts = { Easy: 0, Medium: 0, Hard: 0 };
    const uniqueSolvedSet = new Set();

    submissions.forEach((sub) => {
      if (sub.verdict === "Accepted" && sub.problem) {
        const problemId = sub.problem._id.toString();
        if (!uniqueSolvedSet.has(problemId)) {
          uniqueSolvedSet.add(problemId);
          if (solvedCounts[sub.problem.difficulty] !== undefined) {
            solvedCounts[sub.problem.difficulty]++;
          }
        }
      }
    });

    // Fetch total problems from Stats
    const stats = await Stats.findOne();

    res.status(200).json({
      user: {
        _id,
        username,
        email,
        role,
        profilePicture,
        solved: allSubmissions, // all submissions including duplicates
        solvedCounts, // unique counts per difficulty for progress
        stats, // total problems for progress calculation
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateProfile(req, res) {
  // Update profile logic
  try {
    const { username, email, profilePicture } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let imageUrl = null;

    if (profilePicture) {
      const result = await cloudinary.uploader.upload(profilePicture, {
        resource_type: "image",
        folder: "online-judge/profile-pictures",
      });
      imageUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, ...(imageUrl && { profilePicture: imageUrl }) },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.log("Error in update profile controller: " + error);
    return res
      .status(500)
      .json({ message: "Error in update profile controller" });
  }
}

export { getUserProfile, updateProfile };
