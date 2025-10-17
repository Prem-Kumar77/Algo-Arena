import mongoose from "mongoose";
import slugify from "slugify";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
      trim: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    examples: {
      type: [
        {
          input: {
            type: String,
            required: true,
          },
          output: {
            type: String,
            required: true,
          },
          explanation: {
            type: String,
          },
        },
      ],
    },
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
      index: true,
    },
    testCases: {
      type: [
        {
          input: {
            type: String,
            required: true,
          },
          output: {
            type: String,
            required: true,
          },
          hidden: {
            type: Boolean,
            default: false,
          },
        },
      ],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one test case is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    dislikes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    timelimit: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 10,
    },
    memorylimit: {
      type: Number,
      required: true,
      default: 256,
      min: 32,
      max: 2048,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

problemSchema.index({ tags: 1 });
problemSchema.index({ tags: 1, difficulty: 1 });
problemSchema.index({ title: "text", description: "text" });
problemSchema.index({ createdAt: -1 });

problemSchema.pre("remove", async function (next) {
  await mongoose.model("Discussion").deleteMany({ problem: this._id });
  await mongoose.model("Submission").deleteMany({ problem: this._id });
  next();
});

problemSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Discussion").deleteMany({ problem: doc._id });
    await mongoose.model("Submission").deleteMany({ problem: doc._id });
  }
});

problemSchema.pre("validate", async function (next) {
  if (!this.slug && this.title) {
    const rawSlug = slugify(this.title, {
      lower: true,
      strict: true,
    });
    let counter = 1;
    let slug = rawSlug;
    while (await mongoose.model("Problem").exists({ slug })) {
      slug = `${rawSlug}-${counter++}`;
    }
    this.slug = slug;
  }
});

problemSchema.plugin(mongooseLeanVirtuals);

export default mongoose.model("Problem", problemSchema);
