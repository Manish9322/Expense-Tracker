import { NextResponse } from "next/server";
import _db from "../../services/db.js";
import Expense from "../../models/Expense.model.js";
import DailyExpenseLog from "../../models/DailyExpenseLog.model.js";

export async function POST(request) {
  try {
    await _db();

    // 1. Get all expenses for today
    const today = new Date().toISOString().split("T")[0];
    const expenses = await Expense.find({});
    const checkedExpenses = expenses.filter(e => e.isChecked);

    // 2. Save daily log
    const totalAmount = checkedExpenses.reduce((sum, e) => sum + e.amount, 0);
    await DailyExpenseLog.create({
      date: today,
      expenses: checkedExpenses,
      totalAmount,
    });

    // 3. Delete all expenses with autoAdd: false
    await Expense.deleteMany({ autoAdd: false });

    return NextResponse.json({ message: "Cleanup complete" }, { status: 200 });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}