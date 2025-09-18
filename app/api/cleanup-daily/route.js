import { NextResponse } from "next/server";
import _db from "../../services/db.js";
import Expense from "../../models/Expense.model.js";

/**
 * POST - Cleanup daily expenses (reset isChecked to false for auto-add items)
 */
export async function POST(request) {
  try {
    await _db();

    const body = await request.json();
    const { date } = body;

    console.log(`[API] Cleaning up daily expenses for ${date || 'today'}`);

    // Reset isChecked to false for all auto-add expenses
    const result = await Expense.updateMany(
      { autoAdd: true },
      { $set: { isChecked: false } }
    );

    console.log(`[API] Reset ${result.modifiedCount} auto-add expenses`);

    return NextResponse.json({
      success: true,
      message: `Successfully reset ${result.modifiedCount} auto-add expenses`,
      data: {
        modifiedCount: result.modifiedCount,
        date: date || new Date().toISOString().split("T")[0]
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[API] Error cleaning up daily expenses:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to cleanup daily expenses",
      message: error.message
    }, { status: 500 });
  }
}