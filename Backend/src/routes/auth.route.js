import { Router } from "express";
import {
  signup,
  login,
  logout,
  refresh,
  check,
  getStats,
} from "../controllers/auth.controller.js";
import {
  signupValidator,
  loginValidator,
} from "../middleware/validators/auth.validator.js";
import {
  validate,
  protectRoute,
  isAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signupValidator, validate, signup);
router.post("/login", loginValidator, validate, login);
router.get("/check", protectRoute, check);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/admin/stats", protectRoute, isAdmin, getStats);

export default router;
