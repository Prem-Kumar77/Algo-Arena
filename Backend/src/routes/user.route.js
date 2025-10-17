import { Router } from "express";
import {
  getUserProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute, validate } from "../middleware/auth.middleware.js";
import { updateProfileValidator } from "../middleware/validators/auth.validator.js";

const router = Router();

router.get("/profile", protectRoute, getUserProfile);
router.patch(
  "/profile",
  protectRoute,
  updateProfileValidator,
  validate,
  updateProfile
);

export default router;
