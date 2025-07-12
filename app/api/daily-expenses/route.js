import { NextResponse } from "next/server";
import _db from "../../services/db.js";
import DailyExpenseLog from "../../models/DailyExpenseLog.model.js";

// GET all daily expense logs
export async function GET() {
  try {
    await _db(); // Ensure database connection
    const logs = await DailyExpenseLog.find({}).sort({ date: -1 }); // Sort by date (newest first)
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("Error fetching daily expense logs:", error);
    return NextResponse.json(
      { error: "Error fetching daily expense logs" },
      { status: 500 }
    );
  }
}

// POST new daily expense log
export async function POST(request) {
  try {
    await _db(); // Ensure database connection
    const data = await request.json();

    // Basic input validation
    if (!data.date || !data.expenses || !Array.isArray(data.expenses)) {
      return NextResponse.json(
        { error: "Date and expenses array are required" },
        { status: 400 }
      );
    }
    if (data.expenses.some(exp => !exp.title || !exp.amount || !exp.category)) {
      return NextResponse.json(
        { error: "All expenses must have title, amount, and category" },
        { status: 400 }
      );
    }
    if (data.totalAmount < 0) {
      return NextResponse.json(
        { error: "Total amount cannot be negative" },
        { status: 400 }
      );
    }

    const existingLog = await DailyExpenseLog.findOne({ date: data.date });
    if (existingLog) {
      return NextResponse.json(
        { error: "A log already exists for this date" },
        { status: 400 }
      );
    }

    const log = await DailyExpenseLog.create({
      date: data.date,
      expenses: data.expenses,
      totalAmount: parseFloat(data.totalAmount),
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Error creating daily expense log:", error);
    return NextResponse.json(
      { error: "Error creating daily expense log" },
      { status: 500 }
    );
  }
}