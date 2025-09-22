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

    const body = await request.json().catch(() => ({}));
    const { date: requestDate } = body || {};

    // Check if this is a cron job execution (no body or user-agent indicates cron)
    const isCronJob = !requestDate && (
      request.headers.get('user-agent')?.includes('vercel-cron') ||
      !request.headers.get('user-agent')
    );

    // Allow manual date override, default to yesterday for cron jobs
    let targetDate;
    if (requestDate) {
      targetDate = requestDate;
    } else if (isCronJob) {
      // For cron jobs, create log for yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = yesterday.toISOString().split("T")[0];
    } else {
      // For manual calls without date, use today
      targetDate = new Date().toISOString().split("T")[0];
    }
    
    console.log(`[API] Creating daily log for ${targetDate} (isCronJob: ${isCronJob})`);

    // Check if log already exists for this date
    const existingLog = await DailyExpenseLog.findOne({ date: targetDate });
    if (existingLog) {
      console.log(`[API] Log already exists for ${targetDate}`);
      return NextResponse.json({
        success: true,
        message: `Daily log already exists for ${targetDate}`,
        data: {
          date: targetDate,
          logId: existingLog._id,
          totalAmount: existingLog.totalAmount,
          expenseCount: existingLog.expenses.length
        }
      }, { status: 200 });
    }

    // Get expenses created on the target date
    const startOfDay = new Date(targetDate + 'T00:00:00.000Z');
    const endOfDay = new Date(targetDate + 'T23:59:59.999Z');
    
    const expenses = await Expense.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ createdAt: -1 });

    // Always create log regardless of whether there are expenses or not
    const checkedExpenses = expenses.filter(expense => expense.isChecked);
    const totalAmount = checkedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    console.log(`[API] Found ${expenses.length} expenses for ${targetDate} (${checkedExpenses.length} checked, total: $${totalAmount})`);

    // Create daily log for that specific date
    const dailyLog = await DailyExpenseLog.create({
      date: targetDate,
      expenses: expenses, // Store all expenses from that specific day (can be empty array)
      totalAmount: totalAmount // Calculate total from checked ones
    });

    console.log(`[API] Successfully created daily log for ${targetDate} with ${expenses.length} expenses`);

    // If this is a cron job, also trigger cleanup
    if (isCronJob) {
      try {
        const cleanupResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/cleanup-daily`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date: targetDate })
        });
        
        const cleanupResult = await cleanupResponse.json();
        console.log(`[API] Cleanup result for cron job:`, cleanupResult.message);
      } catch (cleanupError) {
        console.error(`[API] Cleanup failed during cron job:`, cleanupError);
        // Don't fail the main operation if cleanup fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily log created successfully for ${targetDate}`,
      data: {
        id: dailyLog._id,
        date: targetDate,
        totalExpenses: expenses.length,
        checkedExpenses: checkedExpenses.length,
        totalAmount: totalAmount,
        isCronJob: isCronJob
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[API] Error creating daily expense log:", error);
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: "Daily log already exists for this date",
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

/**
 * PATCH - Backfill missing daily logs for all dates with expenses
 */
export async function PATCH(request) {
  try {
    await _db();

    console.log('[API] Starting backfill process for missing daily logs...');

    // Get all expenses and group them by date
    const allExpenses = await Expense.find({}).sort({ createdAt: 1 });
    
    if (allExpenses.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expenses found to create logs from",
        data: { logsCreated: 0 }
      }, { status: 200 });
    }

    // Group expenses by date
    const expensesByDate = {};
    allExpenses.forEach(expense => {
      const expenseDate = expense.createdAt.toISOString().split('T')[0];
      if (!expensesByDate[expenseDate]) {
        expensesByDate[expenseDate] = [];
      }
      expensesByDate[expenseDate].push(expense);
    });

    const dates = Object.keys(expensesByDate).sort();
    const logsCreated = [];
    const logsSkipped = [];

    // Create logs for each date that has expenses
    for (const date of dates) {
      try {
        // Check if log already exists
        const existingLog = await DailyExpenseLog.findOne({ date });
        if (existingLog) {
          logsSkipped.push({
            date,
            reason: 'Log already exists',
            logId: existingLog._id
          });
          continue;
        }

        const dateExpenses = expensesByDate[date];
        const checkedExpenses = dateExpenses.filter(expense => expense.isChecked);
        const totalAmount = checkedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Create daily log for this date
        const dailyLog = await DailyExpenseLog.create({
          date,
          expenses: dateExpenses,
          totalAmount: totalAmount
        });

        logsCreated.push({
          date,
          logId: dailyLog._id,
          totalExpenses: dateExpenses.length,
          checkedExpenses: checkedExpenses.length,
          totalAmount: totalAmount
        });

        console.log(`[API] Created daily log for ${date}: ${dateExpenses.length} expenses, total: $${totalAmount}`);

      } catch (error) {
        console.error(`[API] Error creating log for ${date}:`, error);
        logsSkipped.push({
          date,
          reason: error.message
        });
      }
    }

    console.log(`[API] Backfill completed: ${logsCreated.length} logs created, ${logsSkipped.length} skipped`);

    return NextResponse.json({
      success: true,
      message: `Backfill completed successfully`,
      data: {
        logsCreated: logsCreated.length,
        logsSkipped: logsSkipped.length,
        details: {
          created: logsCreated,
          skipped: logsSkipped
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[API] Error during backfill process:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to backfill daily logs",
      message: error.message
    }, { status: 500 });
  }
}