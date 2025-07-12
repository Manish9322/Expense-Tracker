import mongoose from "mongoose";

const dailyExpenseLogSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true, // Ensure one log per day
      trim: true,
    },
    expenses: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        description: {
          type: String,
          trim: true,
          default: "",
        },
        autoAdd: {
          type: Boolean,
          default: false,
        },
        isChecked: {
          type: Boolean,
          default: true,
        },
        category: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.DailyExpenseLog ||
  mongoose.model("DailyExpenseLog", dailyExpenseLogSchema);