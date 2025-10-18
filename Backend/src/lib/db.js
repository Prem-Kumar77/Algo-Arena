import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI environment variable is not set");
      console.log("⚠️ Server will start without database connection");
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.log("⚠️ Server will start without database connection");
    // Don't exit process, let the server start without DB
  }
};

export default connectDB;
