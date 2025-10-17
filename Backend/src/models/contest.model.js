import mongoose from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problems: {
    type: [
      {
        problem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },
        points: {
          type: Number,
          default: 500,
        },
      },
    ],
    validate: {
      validator: function (v) {
        return v.length >= 3;
      },
      message: "At least three problems must be added.",
    },
  },
  description: {
    type: String,
    default: " ",
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  leaderboard: {
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        totalScore: {
          type: Number,
          default: 0,
        },
        problemScores: {
          type: [
            {
              problem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Problem",
              },
              score: {
                type: Number,
                default: 0,
              },
            },
          ],
        },
        submissions: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
          },
        ],
        rank: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
});

contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ createdBy: 1 });

contestSchema.virtual("timeLeft").get(function () {
  const now = new Date();
  const end = this.endTime;
  const timeDiff = end - now;
  return timeDiff > 0 ? timeDiff : 0;
});

contestSchema.pre("save", function (next) {
  const now = new Date();
  if (now < this.startTime) this.status = "upcoming";
  else if (now >= this.startTime && now <= this.endTime)
    this.status = "ongoing";
  else this.status = "completed";
  next();
});

contestSchema.virtual("computedStatus").get(function () {
  const now = new Date();
  if (now < this.startTime) return "upcoming";
  if (now >= this.startTime && now <= this.endTime) return "ongoing";
  return "completed";
});

contestSchema.plugin(mongooseLeanVirtuals);
const Contest = mongoose.model("Contest", contestSchema);

export default Contest;
