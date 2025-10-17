import { Router } from "express";
import {
  allSubmissionsByUser,
  problemSubmissionsByUser,
  getSubmissionById,
  createSubmission,
  runCode,
} from "../controllers/submission.controller.js";
import { isLoggedIn, protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/user/", protectRoute, isLoggedIn, allSubmissionsByUser);
router.get(
  "/problem/:problemId",
  protectRoute,
  isLoggedIn,
  problemSubmissionsByUser
);
router.get("/submission/:submissionId", getSubmissionById);
router.post("/:problemId", protectRoute, isLoggedIn, createSubmission);
router.post("/:problemId/run", protectRoute, isLoggedIn, runCode);
export default router;
