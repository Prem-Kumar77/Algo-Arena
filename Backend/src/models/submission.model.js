import mongoose from "mongoose";
import { type } from "os";

const submissionSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["python", "java", "cpp"],
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    memoryUsage: {
      type: Number,
      default: 0,
    },
    compileError: {
      type: String,
      default: "",
    },
    testResults: [
      {
        testCase: {
          type: Number,
        },
        passed: {
          type: Boolean,
        },
        input: {
          type: String,
        },
        expectedOutput: {
          type: String,
        },
        output: {
          type: String,
        },
      },
    ],
    passedCases: {
      type: Number,
      default: 0,
    },
    isInContest: {
      type: Boolean,
      default: false,
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
    },
    verdict: {
      type: String,
      required: true,
      default: "Pending",
    },
  },
  { timestamps: true }
);

submissionSchema.index({ problem: 1, user: 1 });
submissionSchema.index({ problem: 1, status: 1 });
submissionSchema.index({ createdAt: -1 });

export default mongoose.model("Submission", submissionSchema);
