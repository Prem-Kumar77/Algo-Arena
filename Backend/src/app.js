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

// Allow single or comma-separated list of origins via CLIENT_URL (trim + no trailing slash)
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, "");
    if (allowedOrigins.length === 0 || allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/problems", problemRouter);
app.use("/api/problems/:problemId/discussions", discussionRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/contests", contestRouter);

console.log(process.env.PORT);
app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
