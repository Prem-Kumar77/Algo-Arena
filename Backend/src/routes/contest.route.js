import { Router } from "express";
import {
  protectRoute,
  isAdmin,
  validate,
  optionalAuth,
} from "../middleware/auth.middleware.js";
import {
  getAllContests,
  getContestById,
  joinContest,
  submitSolution,
  getContestLeaderboard,
  createContest,
  updateContest,
  deleteContest,
} from "../controllers/contest.controller.js";

import {
  contestCreationValidator,
  contestUpdateValidator,
  submitCodeValidator,
} from "../middleware/validators/contest.validator.js";

const router = Router();

// User routes
router.get("/", optionalAuth, getAllContests);
router.get("/:id", optionalAuth, getContestById);
router.post("/:id/join", protectRoute, joinContest);
router.post(
  "/:id/problem/:problemId/submit",
  protectRoute,
  submitCodeValidator,
  validate,
  submitSolution
);
router.get("/:id/leaderboard", getContestLeaderboard);

// Admin routes
router.post(
  "/create",
  protectRoute,
  isAdmin,
  contestCreationValidator,
  validate,
  createContest
);
router.patch(
  "/:id",
  protectRoute,
  isAdmin,
  contestUpdateValidator,
  validate,
  updateContest
);
router.delete("/:id", protectRoute, isAdmin, deleteContest);

export default router;
