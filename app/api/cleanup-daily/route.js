import { NextResponse } from "next/server";
import _db from "../../services/db.js";
import Expense from "../../models/Expense.model.js";

/**
 * POST - Cleanup daily expenses (delete non-auto-add, reset auto-add to unchecked)
 */
export async function POST(request) {
  try {
    await _db();

    const body = await request.json();
    const { date } = body;

    console.log(`[API] Cleaning up daily expenses for ${date || 'today'}`);

    // Delete expenses that are NOT set to auto-add
    const deleteResult = await Expense.deleteMany({ autoAdd: false });

    // Reset isChecked to false for all auto-add expenses
    const resetResult = await Expense.updateMany(
      { autoAdd: true },
      { $set: { isChecked: false } }
    );

    console.log(`[API] Deleted ${deleteResult.deletedCount} non-auto-add expenses`);
    console.log(`[API] Reset ${resetResult.modifiedCount} auto-add expenses to unchecked`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: deleted ${deleteResult.deletedCount} non-auto-add expenses, reset ${resetResult.modifiedCount} auto-add expenses`,
      data: {
        deletedCount: deleteResult.deletedCount,
        resetCount: resetResult.modifiedCount,
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