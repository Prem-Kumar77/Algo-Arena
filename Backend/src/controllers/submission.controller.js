import Submission from "../models/submission.model.js";
import User from "../models/user.model.js";
import Problem from "../models/problem.model.js";
import judgeCode from "../services/judge.service.js";

const allowedLanguages = ["python", "java", "cpp"];

async function allSubmissionsByUser(req, res) {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const submissions = await Submission.find({ user: userId })
      .select("problem language code verdict compileError submittedAt")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error("Error in getting all submissions by user:", error);
    res.status(500).json({ error: "Error fetching submissions" });
  }
}

async function problemSubmissionsByUser(req, res) {
  try {
    const userId = req.user._id;
    const problemId = req.params.problemId;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const submissions = await Submission.find({
      user: userId,
      problem: problemId,
    })
      .select("problem language code verdict compileError submittedAt")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error("Error in getting problem submissions by user:", error);
    res.status(500).json({ error: "Error fetching problem submissions" });
  }
}

async function getSubmissionById(req, res) {
  try {
    const submissionId = req.params.submissionId;
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    res.json({
      code: submission.code,
      language: submission.language,
      verdict: submission.verdict,
      compileError: submission.compileError,
      testResults: submission.testResults,
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    console.error("Error in getting submission by ID:", error);
    res.status(500).json({ error: "Error fetching submission" });
  }
}

async function createSubmission(req, res) {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { language, code, isInContest } = req.body;

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({ error: "Invalid programming language" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Run judge
    const verdictResponse = await judgeCode({
      code,
      language,
      testCases: problem.testCases,
    });

    // Save submission
    const newSubmission = new Submission({
      user: userId,
      problem: problemId,
      language,
      code,
      isInContest: isInContest || false,
      verdict: verdictResponse.verdict,
      compileError: verdictResponse.compileError,
      passedCases: verdictResponse.passedCount,
      totalCases: verdictResponse.total,
      testResults: verdictResponse.testResults,
    });

    await newSubmission.save();

    res.status(201).json({
      verdict: verdictResponse.verdict,
      code: code,
      language: verdictResponse.language,
      details: verdictResponse.details,
      passedCases: verdictResponse.passedCases,
      errorMessage: verdictResponse.errorMessage || null,
    });
  } catch (error) {
    console.error("Error in creating submission:", error);
    res.status(500).json({ error: "Error creating submission" });
  }
}

async function runCode(req, res) {
  try {
    const { problemId } = req.params;
    const { lang, code } = req.body;

    if (!allowedLanguages.includes(lang)) {
      return res.status(400).json({ error: "Invalid programming language" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const verdictResponse = await judgeCode({
      code,
      language: lang,
      testCases: problem.testCases.slice(0, 3), // only first 3
    });

    res.status(201).json({
      verdict: verdictResponse.verdict,
      language: verdictResponse.language,
      details: verdictResponse.details,
      passedCases: verdictResponse.passedCases,
      errorMessage: verdictResponse.errorMessage || null, // ✅ always return
    });
  } catch (error) {
    console.error("Error in Running submission:", error);
    res.status(500).json({ error: "Error Running submission" });
  }
}

export {
  allSubmissionsByUser,
  problemSubmissionsByUser,
  getSubmissionById,
  createSubmission,
  runCode,
};
