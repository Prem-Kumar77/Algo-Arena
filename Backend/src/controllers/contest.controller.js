import Contest from "../models/contest.model.js";
import Submission from "../models/submission.model.js";
import judgeCode from "../services/judge.service.js";
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";
import Discussion from "../models/discussion.model.js";
import redis from "../lib/redis.js";
import mongoose from "mongoose";

// Helpers

const REDIS_CONTEST_TTL_ACTIVE = 60 * 60; // 1 hour while contest is active
const REDIS_CONTEST_TTL_COMPLETED = 60 * 60;
const REDIS_CONTEST_TTL = 60 * 60; // 1 day after contest ends

function calculateScore(initialScore, contestStartTime, submissionTime) {
  const timePassed =
    (submissionTime.getTime() - contestStartTime.getTime()) / (1000 * 60); // minutes
  const timePenalty = Math.floor(timePassed / 5);
  return Math.max(0, initialScore * (1 - timePenalty / 100));
}

// Update Redis leaderboard
async function updateLeaderboardRedis(contestId, username, problemId, score) {
  const leaderboardKey = `contest:${contestId}:leaderboard`;
  const userProblemsKey = `contest:${contestId}:user:${username}:problems`;

  // Update user’s problem score if better
  const prevScore = await redis.hGet(userProblemsKey, problemId);
  if (!prevScore || score > parseInt(prevScore)) {
    await redis.hSet(userProblemsKey, problemId, score);
  }

  // Calculate total score
  const allScores = await redis.hVals(userProblemsKey);
  const totalScore = allScores.reduce((sum, s) => sum + parseInt(s), 0);

  // Update sorted set leaderboard
  await redis.zAdd(leaderboardKey, [{ score: totalScore, value: username }]);

  // Set same TTL for all contest keys
  const contest = await Contest.findById(contestId).select("endTime");
  const now = new Date();
  const ttl =
    contest.endTime > now
      ? REDIS_CONTEST_TTL_ACTIVE
      : REDIS_CONTEST_TTL_COMPLETED;

  await redis.expire(leaderboardKey, ttl);
  await redis.expire(userProblemsKey, ttl);

  return totalScore;
}

// Update leaderboard in MongoDB
async function updateLeaderboardMongoWithSubmissions({
  contestId,
  userId,
  problemId,
  submissionId,
  score,
}) {
  const contest = await Contest.findById(contestId);
  if (!contest) return;

  // Ensure userId is ObjectId
  const userObjectId =
    userId instanceof mongoose.Types.ObjectId
      ? userId
      : new mongoose.Types.ObjectId(userId);

  let entry = contest.leaderboard.find(
    (e) => e.user.toString() === userObjectId.toString() // compare strings
  );

  if (!entry) {
    // New user entry
    entry = {
      user: userObjectId,
      totalScore: score,
      problemScores: [{ problem: problemId, score }],
      submissions: [submissionId],
      rank: 0,
    };
    contest.leaderboard.push(entry);
  } else {
    // Add submission ID
    entry.submissions.push(submissionId);

    // Update problem score
    const psIndex = entry.problemScores.findIndex(
      (ps) => ps.problem.toString() === problemId.toString()
    );
    if (psIndex === -1) {
      entry.problemScores.push({ problem: problemId, score });
    } else {
      entry.problemScores[psIndex].score = Math.max(
        entry.problemScores[psIndex].score,
        score
      );
    }
  }

  // Recalculate total score
  contest.leaderboard.forEach((e) => {
    e.totalScore = e.problemScores.reduce((sum, ps) => sum + ps.score, 0);
  });

  // Re-rank leaderboard
  contest.leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  contest.leaderboard.forEach((e, i) => (e.rank = i + 1));

  contest.markModified("leaderboard"); // important for nested arrays
  await contest.save();
}

// Routes

async function getAllContests(req, res) {
  try {
    let contests = await Contest.find()
      .populate("createdBy", "username")
      .lean({ virtuals: true });

    const now = new Date();

    contests = contests.map((contest) => {
      const userId = req.user?.id;

      // Check if user is registered (only if userId exists)
      const isRegistered = userId
        ? contest.participants.some(
            (p) => (p._id ? p._id.toString() : p.toString()) === userId
          )
        : false;

      // Hide problem details for upcoming contests if user is not admin
      const hideDetails =
        userId &&
        req.user?.role !== "admin" &&
        now < new Date(contest.startTime);

      return {
        _id: contest._id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
        participants: contest.participants.length,
        problems: hideDetails ? contest.problems.length : contest.problems,
        isRegistered,
        message: hideDetails
          ? "Contest details are hidden until it starts"
          : undefined,
      };
    });

    res.status(200).json(contests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ message: "Error fetching contests" });
  }
}

async function getContestById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid contest ID format" });
    }

    let contest = await Contest.findById(id)
      .populate("createdBy", "username")
      .populate("problems.problem", "title")
      .lean({ virtuals: true });

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    contest.problems = (contest.problems || []).filter(
      (p) => p.problem && p.problem._id
    );

    const userId = req.user?.id;

    const isRegistered = userId
      ? contest.participants.some(
          (p) => (p._id ? p._id.toString() : p.toString()) === userId
        )
      : false;

    contest = JSON.parse(JSON.stringify(contest));

    const now = new Date();

    if (req.user?.role === "admin")
      return res.status(200).json({ contest, isRegistered });

    if (contest.status === "completed") {
      const problemIds = contest.problems.map((p) => p.problem._id);
      await Problem.updateMany(
        { _id: { $in: problemIds } },
        { $set: { active: true } }
      );
    }
    if (now < new Date(contest.startTime)) {
      return res.status(200).json({
        _id: contest._id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
        isRegistered,
        message: "Contest details are hidden until it starts",
      });
    }

    res.status(200).json({ contest, isRegistered });
  } catch (error) {
    console.error("Error fetching contest:", error);
    res.status(500).json({ message: "Error fetching contest" });
  }
}

async function createContest(req, res) {
  try {
    const { title, description, startTime, endTime, problems } = req.body;
    const createdBy = req.user.id;
    const newContest = new Contest({
      title,
      description,
      startTime,
      endTime,
      createdBy,
      problems,
    });
    await newContest.save();
    res.status(201).json(newContest);
  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({ message: "Error creating contest" });
  }
}

async function updateContest(req, res) {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, problems } = req.body;

    // Fetch existing contest to get current startTime if needed
    const existingContest = await Contest.findById(id);
    if (!existingContest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Determine effective startTime and endTime
    const effectiveStartTime = startTime
      ? new Date(startTime)
      : existingContest.startTime;
    const effectiveEndTime = endTime
      ? new Date(endTime)
      : existingContest.endTime;

    // Validate time logic
    if (effectiveEndTime <= effectiveStartTime) {
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
    }

    // Build update object dynamically
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (startTime !== undefined) updateFields.startTime = effectiveStartTime;
    if (endTime !== undefined) updateFields.endTime = effectiveEndTime;
    if (problems !== undefined) updateFields.problems = problems;

    // Update contest
    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true, context: "query" }
    );

    res.status(200).json(updatedContest);
  } catch (error) {
    console.error("Error updating contest:", error);
    res.status(500).json({ message: "Error updating contest" });
  }
}

async function deleteContest(req, res) {
  try {
    const { id } = req.params;

    // Find the contest
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Delete the contest itself
    await Contest.findByIdAndDelete(id);

    res.status(204).json({ message: "Contest deleted successfully" });
  } catch (error) {
    console.error("Error deleting contest:", error);
    res.status(500).json({ message: "Error deleting contest" });
  }
}

async function joinContest(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const now = new Date();

    // Atomically add user to participants array if not already present
    const updatedContest = await Contest.findOneAndUpdate(
      { _id: id, endTime: { $gt: now } }, // only ongoing contests
      { $addToSet: { participants: userId } }, // add only if not present
      { new: true }
    );

    if (!updatedContest) {
      const contestExists = await Contest.exists({ _id: id });
      if (!contestExists)
        return res.status(404).json({ message: "Contest not found" });
      return res.status(400).json({ message: "Contest has ended" });
    }

    res.status(200).json({ message: "Successfully joined the contest" });
  } catch (error) {
    console.error("Error joining contest:", error);
    res.status(500).json({ message: "Error joining contest" });
  }
}

async function submitSolution(req, res) {
  try {
    const { id: contestId, problemId } = req.params;
    const userId = req.user.id;
    const { code, language } = req.body;

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    if (!contest.participants.some((p) => p.toString() === userId))
      return res.status(403).json({ message: "User is not a participant" });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const now = new Date();
    if (contest.startTime > now)
      return res.status(400).json({ message: "Contest has not started yet" });
    if (contest.endTime < now)
      return res.status(400).json({ message: "Contest has ended" });

    // Judge code
    const verdictResponse = await judgeCode({
      code,
      language,
      testCases: problem.testCases,
    });

    // Save submission
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      isInContest: true,
      contest: contestId,
      verdict: verdictResponse.verdict,
      testResults: verdictResponse.details,
      passedCases: verdictResponse.passedCount,
    });
    await submission.save();

    // Calculate score
    let score = 0;
    if (verdictResponse.verdict === "Accepted") {
      const problemEntry = contest.problems.find(
        (p) => p.problem.toString() === problemId.toString()
      );
      const initialScore = problemEntry ? problemEntry.points : 0;
      score = Math.floor(calculateScore(initialScore, contest.startTime, now));
    }

    // Update MongoDB leaderboard
    await updateLeaderboardMongoWithSubmissions({
      contestId,
      userId,
      problemId,
      submissionId: submission._id,
      score,
    });

    // Optionally update Redis if you are caching leaderboard
    await updateLeaderboardRedis(
      contestId,
      req.user.username,
      problemId,
      score
    );

    res.status(201).json({
      submission: {
        id: submission._id,
        verdict: submission.verdict,
        passedCases: submission.passedCases,
        totalCases: problem.testCases.length,
        score,
        code: submission.code,
        language: submission.language,
      },
      message:
        submission.verdict === "Accepted"
          ? "Solution accepted!"
          : "Solution rejected. Try again.",
    });
  } catch (err) {
    console.error("Error submitting solution:", err);
    res.status(500).json({ message: "Error submitting solution" });
  }
}

async function getContestLeaderboard(req, res) {
  try {
    const { id: contestId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const leaderboardKey = `contest:${contestId}:leaderboard`;

    // 1️⃣ Try Redis first
    let topUsers = await redis.zRangeWithScores(leaderboardKey, start, end, {
      REV: true,
    });

    // 2️⃣ If empty, fallback to MongoDB
    if (!topUsers || topUsers.length === 0) {
      const contest = await Contest.findById(contestId)
        .populate("leaderboard.user", "username")
        .lean();

      if (!contest)
        return res.status(404).json({ message: "Contest not found" });

      const pipeline = redis.multi();

      // Populate Redis
      for (const entry of contest.leaderboard) {
        const userKey = `contest:${contestId}:user:${entry.user.username}:problems`;

        entry.problemScores.forEach((ps) => {
          if (ps.score > 0)
            pipeline.hSet(userKey, ps.problem.toString(), ps.score);
        });

        pipeline.zAdd(leaderboardKey, [
          { score: entry.totalScore, value: entry.user.username },
        ]);
        pipeline.expire(userKey, REDIS_CONTEST_TTL);
      }
      pipeline.expire(leaderboardKey, REDIS_CONTEST_TTL);
      await pipeline.exec();

      topUsers = await redis.zRangeWithScores(leaderboardKey, start, end, {
        REV: true,
      });
    } else {
      // Refresh TTL
      const pipeline = redis.multi();
      pipeline.expire(leaderboardKey, REDIS_CONTEST_TTL);
      for (const { value: username } of topUsers) {
        const userKey = `contest:${contestId}:user:${username}:problems`;
        pipeline.expire(userKey, REDIS_CONTEST_TTL);
      }
      await pipeline.exec();
    }

    // 3️⃣ Build leaderboard response
    const leaderboard = [];
    for (const { value: username, score: totalScore } of topUsers) {
      const userKey = `contest:${contestId}:user:${username}:problems`;
      const problemsRaw = await redis.hGetAll(userKey);

      const problemsSolved = Object.entries(problemsRaw || {}).map(
        ([problemId, score]) => ({
          problem: problemId,
          score: parseFloat(score),
        })
      );

      leaderboard.push({
        username,
        totalScore: parseFloat(totalScore),
        problemsSolved,
      });
    }

    leaderboard.forEach((entry, i) => (entry.rank = start + i + 1));

    res.status(200).json({ page, limit, leaderboard });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
}

export {
  getAllContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  joinContest,
  submitSolution,
  getContestLeaderboard,
};
