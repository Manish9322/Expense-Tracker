import { MONGODB_URL } from "../services/config.js";
import mongoose from "mongoose";

const _db = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log("MongoDB is already connected");
      return;
    }
    await mongoose.connect(MONGODB_URL, {
      dbName: 'expense-tracker', // Explicitly specify the database
    });
    console.log("MongoDB connected successfully to expense-tracker database");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default _db;