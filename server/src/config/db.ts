import mongoose from "mongoose";

export async function connectDB() {
  try {
    const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tv-log";
    await mongoose.connect(connStr);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
