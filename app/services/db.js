import { MONGODB_URL } from "../services/config.js";
import mongoose from "mongoose";

const _db = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log("MongoDB is already connected");
      return;
    }
    
    if (!MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined in environment variables");
    }
    
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URL, {
      dbName: 'expense-tracker', // Explicitly specify the database
    });
    console.log("MongoDB connected successfully to expense-tracker database");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Full error:", error);
    throw error; // Don't exit process on Vercel, just throw the error
  }
};

export default _db;