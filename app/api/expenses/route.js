import { NextResponse } from "next/server";
import _db from "../../services/db.js";
import Expense from "../../models/Expense.model.js";

// GET all expenses
export async function GET() {
  try {
    await _db(); // Ensure database connection
    const expenses = await Expense.find({}).sort({ createdAt: -1 }); // Sort by creation date (newest first)
    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Error fetching expenses" },
      { status: 500 }
    );
  }
}

// POST new expense
export async function POST(request) {
  try {
    await _db(); // Ensure database connection
    const data = await request.json();

    // Basic input validation
    if (!data.title || !data.amount || !data.category) {
      return NextResponse.json(
        { error: "Title, amount, and category are required" },
        { status: 400 }
      );
    }
    if (data.amount < 0) {
      return NextResponse.json(
        { error: "Amount cannot be negative" },
        { status: 400 }
      );
    }

    const expense = await Expense.create({
      title: data.title,
      amount: parseFloat(data.amount),
      description: data.description || "",
      autoAdd: data.autoAdd || false,
      isChecked: data.isChecked !== undefined ? data.isChecked : true,
      category: data.category,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Error creating expense" },
      { status: 500 }
    );
  }
}

// DELETE expense by ID
export async function DELETE(request) {
  try {
    await _db(); // Ensure database connection

    // Get the expense ID from the request body (for fetch with body)
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }


    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Expense deleted successfully", id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Error deleting expense" },
      { status: 500 }
    );
  }
}

// PUT expense by ID (edit all fields)
export async function PUT(request) {
  try {
    await _db();
    const { id, title, amount, description, autoAdd, isChecked, category } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    // Build update object dynamically
    const updateObj = {};
    if (title !== undefined) updateObj.title = title;
    if (amount !== undefined) updateObj.amount = amount;
    if (description !== undefined) updateObj.description = description;
    if (autoAdd !== undefined) updateObj.autoAdd = autoAdd;
    if (isChecked !== undefined) updateObj.isChecked = isChecked;
    if (category !== undefined) updateObj.category = category;

    if (Object.keys(updateObj).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await Expense.findByIdAndUpdate(id, updateObj, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Error updating expense" },
      { status: 500 }
    );
  }
}

// PATCH expense by ID (update autoAdd or isChecked)
export async function PATCH(request) {
  try {
    await _db();
    const { id, autoAdd, isChecked } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    // Build update object dynamically
    const updateObj = {};
    if (typeof autoAdd === "boolean") updateObj.autoAdd = autoAdd;
    if (typeof isChecked === "boolean") updateObj.isChecked = isChecked;

    if (Object.keys(updateObj).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await Expense.findByIdAndUpdate(
      id,
      updateObj,
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Error updating expense" },
      { status: 500 }
    );
  }
}