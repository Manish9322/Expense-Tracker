import { NextResponse } from "next/server";
import _db from "../../services/db.js";
import Expense from "../../models/Expense.model.js";
import DailyExpenseLog from "../../models/DailyExpenseLog.model.js";

/**
 * GET - Fetch all daily expense logs
 */
export async function GET() {
  try {
    await _db();

    const dailyLogs = await DailyExpenseLog.find({})
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .limit(100); // Limit to last 100 days for performance

    return NextResponse.json({
      success: true,
      data: dailyLogs,
      count: dailyLogs.length
    }, { status: 200 });

  } catch (error) {
    console.error("[API] Error fetching daily expense logs:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch daily expense logs",
      message: error.message
    }, { status: 500 });
  }
}

/**
 * POST - Create a new daily expense log
 */
export async function POST(request) {
  try {
    await _db();

    // Get today's date
    const today = new Date().toISOString().split("T")[0];
    
    console.log(`[API] Creating daily log for ${today}`);

    // Check if log already exists
    const existingLog = await DailyExpenseLog.findOne({ date: today });
    if (existingLog) {
      console.log(`[API] Log already exists for ${today}`);
      return NextResponse.json({
        success: true,
        message: `Daily log already exists for ${today}`,
        data: {
          date: today,
          logId: existingLog._id,
          totalAmount: existingLog.totalAmount,
          expenseCount: existingLog.expenses.length
        }
      }, { status: 200 });
    }

    // Get all expenses
    const expenses = await Expense.find({}).sort({ createdAt: -1 });
    const checkedExpenses = expenses.filter(expense => expense.isChecked);
    const totalAmount = checkedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Create daily log
    const dailyLog = await DailyExpenseLog.create({
      date: today,
      expenses: expenses, // Store all expenses
      totalAmount: totalAmount // But only calculate total from checked ones
    });

    console.log(`[API] Successfully created daily log for ${today}`);

    return NextResponse.json({
      success: true,
      message: `Daily log created successfully for ${today}`,
      data: {
        id: dailyLog._id,
        date: today,
        totalExpenses: expenses.length,
        checkedExpenses: checkedExpenses.length,
        totalAmount: totalAmount
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[API] Error creating daily expense log:", error);
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: "Daily log already exists for today",
        message: "A log entry has already been created for this date"
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: "Failed to create daily expense log",
      message: error.message
    }, { status: 500 });
  }
}