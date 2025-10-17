import Discussion from "../models/discussion.model.js";
import Problem from "../models/problem.model.js";

async function getProblemDiscussions(req, res) {
  try {
    const { problemId } = req.params;

    const discussions = await Discussion.find({ problem: problemId })
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();

    if (req.user) {
      // Add flags to show user's reaction status
      discussions.forEach((d) => {
        d.likedByUser = d.likes.some(
          (id) => id.toString() === req.user._id.toString()
        );
        d.dislikedByUser = d.dislikes.some(
          (id) => id.toString() === req.user._id.toString()
        );
        d.comments.forEach((c) => {
          c.likedByUser = c.likes?.some(
            (id) => id.toString() === req.user._id.toString()
          );
          c.dislikedByUser = c.dislikes?.some(
            (id) => id.toString() === req.user._id.toString()
          );
        });
      });
    }

    res.json(discussions);
  } catch (error) {
    console.error("Error fetching discussions:", error);
    res.status(500).json({ message: "Failed to fetch discussions" });
  }
}

async function addProblemDiscussion(req, res) {
  try {
    const { problemId } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const newDiscussion = new Discussion({
      problem: problem._id,
      author: req.user._id,
      content,
    });

    await newDiscussion.save();

    const populatedDiscussion = await Discussion.findById(newDiscussion._id)
      .populate("author", "username") // only username
      .populate("comments.user", "username") // only username
      .lean();

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in /problems/:id/discussions:", error);
    res.status(500).json({ message: "Problem in adding discussion" });
  }
}

async function addComment(req, res) {
  try {
    const { problemId, discussionId } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🧱 1. Validate and fetch discussion
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // 📝 2. Create a new comment
    const newComment = {
      user: req.user._id,
      content,
      createdAt: new Date(),
    };

    discussion.comments.push(newComment);
    await discussion.save();

    // 📦 3. Get the last added comment, fully populated
    const populatedComment = await Discussion.populate(
      discussion.comments[discussion.comments.length - 1],
      { path: "user", select: "username email" }
    );

    // ✅ 4. Return only the new comment
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error in /problems/:id/:discussionId:", error);
    res.status(500).json({ message: "Problem in adding comment" });
  }
}

async function toggleDiscussionLike(req, res) {
  try {
    const { problemId, discussionId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const userId = req.user._id;
    if (discussion.likes.includes(userId)) {
      discussion.likes.pull(userId);
    } else {
      discussion.likes.addToSet(userId);
      discussion.dislikes.pull(userId);
    }
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(200).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in toggling discussion like:", error);
    res.status(500).json({ message: "Problem in toggling discussion like" });
  }
}

async function toggleDiscussionDislike(req, res) {
  try {
    const { problemId, discussionId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const userId = req.user._id;
    if (discussion.dislikes.includes(userId)) {
      discussion.dislikes.pull(userId);
    } else {
      discussion.dislikes.addToSet(userId);
      discussion.likes.pull(userId);
    }
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(200).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in toggling discussion dislike: ", error);
    res.status(500).json({ message: "Problem in toggling discussion dislike" });
  }
}

async function toggleCommentLike(req, res) {
  try {
    const { problemId, discussionId, commentId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    const userId = req.user._id;
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId);
    } else {
      comment.likes.addToSet(userId);
      comment.dislikes.pull(userId);
    }
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(200).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in Handling toggle comment like: ", error);
    res.status(500).json({ message: "Problem in toggling comment like" });
  }
}

async function toggleCommentDislike(req, res) {
  try {
    const { problemId, discussionId, commentId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    const userId = req.user._id;
    if (comment.dislikes.includes(userId)) {
      comment.dislikes.pull(userId);
    } else {
      comment.dislikes.addToSet(userId);
      comment.likes.pull(userId);
    }
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(200).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in handling toogle comment dislikes : ", error);
    res.status(500).json({ message: "problem in toogling comment dislike" });
  }
}

export {
  getProblemDiscussions,
  addProblemDiscussion,
  addComment,
  toggleDiscussionLike,
  toggleDiscussionDislike,
  toggleCommentLike,
  toggleCommentDislike,
};
