import { Router } from "express";
import { isLoggedIn, protectRoute } from "../middleware/auth.middleware.js";
import {
  getProblemDiscussions,
  addProblemDiscussion,
  addComment,
  toggleDiscussionLike,
  toggleDiscussionDislike,
  toggleCommentLike,
  toggleCommentDislike,
} from "../controllers/discussion.controller.js";

const router = Router({ mergeParams: true });

router.get("/", getProblemDiscussions);
router.post("/", protectRoute, isLoggedIn, addProblemDiscussion);
router.post("/:discussionId/comments", protectRoute, isLoggedIn, addComment);
router.post(
  "/:discussionId/like",
  protectRoute,
  isLoggedIn,
  toggleDiscussionLike
);
router.post(
  "/:discussionId/dislike",
  protectRoute,
  isLoggedIn,
  toggleDiscussionDislike
);
router.post(
  "/:discussionId/comments/:commentId/like",
  protectRoute,
  isLoggedIn,
  toggleCommentLike
);
router.post(
  "/:discussionId/comments/:commentId/dislike",
  protectRoute,
  isLoggedIn,
  toggleCommentDislike
);

export default router;
