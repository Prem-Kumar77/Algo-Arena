import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({
  easy: {
    type: Number,
    default: 0,
  },
  medium: {
    type: Number,
    default: 0,
  },
  hard: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Stats", statsSchema);
