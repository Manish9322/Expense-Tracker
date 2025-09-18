import { NextResponse } from "next/server";
import _db from "../../services/db.js";
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
 * POST - Create a new daily expense log (same as daily-log but for compatibility)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    await _db();

    const { date, expenses, totalAmount } = body;
    
    // Validate required fields
    if (!date) {
      return NextResponse.json({
        success: false,
        error: "Date is required"
      }, { status: 400 });
    }

    // Check if log already exists
    const existingLog = await DailyExpenseLog.findOne({ date });
    if (existingLog) {
      return NextResponse.json({
        success: false,
        error: "Daily log already exists for this date",
        message: `A log entry has already been created for ${date}`
      }, { status: 409 });
    }

    // Create daily log
    const dailyLog = await DailyExpenseLog.create({
      date,
      expenses: expenses || [],
      totalAmount: totalAmount || 0
    });

    return NextResponse.json({
      success: true,
      message: `Daily log created successfully for ${date}`,
      data: dailyLog
    }, { status: 201 });

  } catch (error) {
    console.error("[API] Error creating daily expense log:", error);
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: "Daily log already exists for this date"
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: "Failed to create daily expense log",
      message: error.message
    }, { status: 500 });
  }
}