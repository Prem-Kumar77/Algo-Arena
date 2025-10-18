import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import problemRouter from "./routes/problem.route.js";
import discussionRouter from "./routes/discussion.route.js";
import submissionRouter from "./routes/submission.route.js";
import contestRouter from "./routes/contest.route.js";

const app = express();
app.set("trust proxy", 1);

dotenv.config();
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.set('trust proxy', 1);

// Allow single or comma-separated list of origins via CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || "").split(",").map((o) => o.trim()).filter(Boolean);
console.log("Allowed origins:", allowedOrigins);

// If no origins configured, allow all origins in development
const corsOptions = allowedOrigins.length > 0 
  ? { origin: allowedOrigins, credentials: true }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));

// Handle preflight with credentials


app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/problems", problemRouter);
app.use("/api/problems/:problemId/discussions", discussionRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/contests", contestRouter);

// Add a basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3000;

console.log(`Starting server on port ${PORT}`);
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  connectDB();
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log the error
});
