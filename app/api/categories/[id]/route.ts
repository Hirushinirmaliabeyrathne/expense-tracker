import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Category from "../../../../models/Category";
import Expense from "../../../../models/Expense"; // Import Expense model
import { verifyAuth } from "../../../../lib/auth-middleware";
import mongoose from "mongoose";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PUT - Update category
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { userId, error } = await verifyAuth(request);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const { id } = await context.params;
    const body = await request.json();
    const { name, emoji, color } = body;

    await connectDB();

    const category = await Category.findOne({ _id: id, userId });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const oldName = category.name; // Save old name to update expenses later

    // Check duplicate name if changing name
    if (name && name.trim() !== oldName) {
      const existing = await Category.findOne({ 
        userId, 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
      });
      if (existing) return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    // Update Category
    if (name) category.name = name.trim();
    if (emoji) category.emoji = emoji;
    if (color) category.color = color;
    await category.save();

    // REAL WORLD FIX: If name changed, update all expenses with that category name
    if (name && name.trim() !== oldName) {
      await Expense.updateMany(
        { userId, category: oldName },
        { $set: { category: name.trim() } }
      );
    }

    return NextResponse.json({ message: "Category updated", category }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE - Delete category AND related expenses
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { userId, error } = await verifyAuth(request);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const { id } = await context.params;

    await connectDB();

    const categoryToDelete = await Category.findOne({ _id: id, userId });
    if (!categoryToDelete) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // REAL WORLD FIX: Delete all expenses associated with this category
    await Expense.deleteMany({ userId, category: categoryToDelete.name });

    // Delete the category
    await Category.deleteOne({ _id: id });

    return NextResponse.json({ message: "Category and related expenses deleted" }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}