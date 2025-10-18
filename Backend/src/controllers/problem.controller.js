import Problem from "../models/problem.model.js";
import Submission from "../models/submission.model.js";
import Discussion from "../models/discussion.model.js";
import Stats from "../models/stats.model.js";

async function getAllProblems(req, res) {
  try {
    // console.log(req);
    const isAdmin = req.user && req.user.role === "admin";

    // Build query
    const query = isAdmin
      ? {} // Admins see all problems
      : { active: { $ne: false } }; // Non-admins see only active !== false

    const allProblems = await Problem.find(query)
      .populate("author", "username")
      .lean();

    const problemsWithCounts = allProblems.map((p) => ({
      ...p,
      likesCount: Array.isArray(p.likes) ? p.likes.length : 0,
      dislikesCount: Array.isArray(p.dislikes) ? p.dislikes.length : 0,
      likes: undefined,
      dislikes: undefined,
      testCases: isAdmin ? p.testCases : undefined,
    }));

    res.status(200).json(problemsWithCounts);
  } catch (error) {
    console.error("Error in /problems/all:", error);
    res.status(500).json({ message: "Problem in getting problems" });
  }
}

async function getProblemById(req, res) {
  try {
    const { id } = req.params;

    // Populate author and discussions
    const problem = await Problem.findById(id)
      .populate("author", "username")
      .lean({ virtuals: true });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Hide test cases for non-admins
    if (req.user?.role !== "admin") {
      problem.testCases = problem.testCases.slice(0, 3);
    }

    res.status(200).json(problem);
  } catch (error) {
    console.error("Error in /problems/:id:", error);
    res.status(500).json({ message: "Problem in getting problem by ID" });
  }
}

async function toggleLikeProblem(req, res) {
  try {
    const { id } = req.params;
    const userid = req.user?._id;
    if (!userid) return res.status(401).json({ message: "Unauthorized" });

    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    if (problem.likes.includes(userid)) {
      problem.likes.pull(userid);
    } else {
      problem.likes.addToSet(userid);
      problem.dislikes.pull(userid);
    }

    await problem.save();

    const updatedProblem = await Problem.findById(id)
      .lean({ virtuals: true })
      .populate("author", "username");

    const isAdmin = req.user?.role === "admin";

    res.status(200).json({
      message: "Toggled like successfully",
      ...updatedProblem,
      testCases: isAdmin ? updatedProblem.testCases : undefined, // only admin sees testCases
    });
  } catch (error) {
    console.error("Error in toggling like a problem:", error);
    res.status(500).json({ message: "Problem in toggling like a problem" });
  }
}

async function toggleDislikeProblem(req, res) {
  try {
    const { id } = req.params;
    const userid = req.user?._id;
    if (!userid) return res.status(401).json({ message: "Unauthorized" });

    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    if (problem.dislikes.includes(userid)) {
      problem.dislikes.pull(userid);
    } else {
      problem.dislikes.addToSet(userid);
      problem.likes.pull(userid);
    }

    await problem.save();

    const updatedProblem = await Problem.findById(id)
      .lean({ virtuals: true })
      .populate("author", "username");

    const isAdmin = req.user?.role === "admin";

    res.status(200).json({
      message: "Toggled dislike successfully",
      ...updatedProblem,
      testCases: isAdmin ? updatedProblem.testCases : undefined, // only admin sees testCases
    });
  } catch (error) {
    console.error("Error in toggling dislike a problem:", error);
    res.status(500).json({ message: "Problem in toggling dislike a problem" });
  }
}

async function createProblem(req, res) {
  try {
    const {
      title,
      description,
      difficulty,
      tags = [],
      author,
      testCases,
      active,
      constraints,
      examples,
    } = req.body;

    const newProblem = new Problem({
      title,
      description,
      difficulty,
      tags,
      author: author || req.user?._id, // fallback to logged-in user if available
      testCases,
      constraints,
      examples,
      active: active || true,
    });

    await newProblem.save();
    res.status(201).json(newProblem);

    await Stats.updateOne(
      {},
      {
        $inc: {
          [newProblem.difficulty.toLowerCase()]: 1,
          total: 1,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error in create problem controller:", error);
    res.status(500).json({ message: "Error creating problem" });
  }
}

async function editProblem(req, res) {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      difficulty,
      tags = [],
      author,
      testCases,
      active,
      constraints,
      examples,
    } = req.body;

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      {
        title,
        description,
        difficulty,
        tags,
        author: author || req.user?._id,
        testCases,
        active,
        constraints,
        examples,
      },
      { new: true }
    );

    res.status(200).json(updatedProblem);
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
  } catch (error) {
    console.error("Error in Editing problem controller:", error);
    res.status(500).json({ message: "Error editing problem" });
  }
}

async function deleteProblem(req, res) {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndDelete(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    await Stats.updateOne(
      {},
      {
        $inc: {
          [problem.difficulty.toLowerCase()]: -1,
          total: -1,
        },
      },
      { upsert: true }
    );

    await Submission.deleteMany({ problem: id });
    await Discussion.deleteMany({ problem: id });
    res.status(204).json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Error in Deleting problem controller:", error);
    res.status(500).json({ message: "Error deleting problem" });
  }
}

export {
  getAllProblems,
  getProblemById,
  toggleLikeProblem,
  toggleDislikeProblem,
  createProblem,
  editProblem,
  deleteProblem,
};
