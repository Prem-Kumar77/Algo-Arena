import { Router } from "express";
import {
  getAllProblems,
  getProblemById,
  toggleLikeProblem,
  toggleDislikeProblem,
  createProblem,
  editProblem,
  deleteProblem,
} from "../controllers/problem.controller.js";
import {
  protectRoute,
  isLoggedIn,
  isAdmin,
  validate,
  optionalAuth,
} from "../middleware/auth.middleware.js";

import {
  createProblemValidator,
  patchProblemValidator,
} from "../middleware/validators/problem.validator.js";

const router = Router();

// User routes

router.get("/", optionalAuth, getAllProblems);
router.get("/:id", getProblemById);
router.post("/:id/like", protectRoute, isLoggedIn, toggleLikeProblem);
router.post("/:id/dislike", protectRoute, isLoggedIn, toggleDislikeProblem);

// Admin routes

router.post(
  "/create",
  protectRoute,
  isLoggedIn,
  isAdmin,
  createProblemValidator,
  validate,
  createProblem
);
router.patch(
  "/:id",
  protectRoute,
  isLoggedIn,
  isAdmin,
  patchProblemValidator,
  validate,
  editProblem
);
router.delete("/:id", protectRoute, isLoggedIn, isAdmin, deleteProblem);

export default router;
