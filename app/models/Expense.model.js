import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
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
  
  { timestamps: true }
);

export default mongoose.models.Expense ||
  mongoose.model("Expense", expenseSchema);
