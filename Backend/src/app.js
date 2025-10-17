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
dotenv.config();
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

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
