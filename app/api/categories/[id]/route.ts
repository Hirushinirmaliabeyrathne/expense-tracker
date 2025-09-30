import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { verifyAuth } from "@/lib/auth-middleware";
import mongoose from "mongoose";

// PUT - Update category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, error } = await verifyAuth(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const id = params.id; // Corrected from `const { id } = params;`
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, emoji, color } = body;

    await connectDB();

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return NextResponse.json({ error: "Category not found or unauthorized" }, { status: 404 });
    }

    // Prevent duplicate names (for this user) if the name is being changed
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ userId, name: name.trim() });
      if (existingCategory) {
        return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
      }
    }

    // Update fields
    if (name !== undefined) category.name = name.trim();
    if (emoji !== undefined) category.emoji = emoji;
    if (color !== undefined) category.color = color;

    await category.save();

    return NextResponse.json({ message: "Category updated successfully", category }, { status: 200 });
  } catch (err: unknown) {
    console.error("PUT category error:", err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : "An unknown error occurred") || "Failed to update category" }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, error } = await verifyAuth(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const id = params.id; // Corrected from `const { id } = params;`
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    await connectDB();

    const deletedCategory = await Category.findOneAndDelete({ _id: id, userId });
    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE category error:", err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : "An unknown error occurred") || "Failed to delete category" }, { status: 500 });
  }
}