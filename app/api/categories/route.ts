import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { verifyAuth } from "@/lib/auth-middleware";
import mongoose from "mongoose"; // Unused in this file, but harmless

// GET - Fetch all categories for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await verifyAuth(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    await connectDB();

    // Fetch categories sorted by creation date
    const categories = await Category.find({ userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ categories }, { status: 200 });
  } catch (err: unknown) {
    console.error("GET categories error:", err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : "An unknown error occurred") || "Failed to fetch categories" }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await verifyAuth(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const { name, emoji, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    await connectDB();

    // Prevent duplicate category names (for this user)
    const existingCategory = await Category.findOne({ userId, name: name.trim() });
    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    const newCategory = await Category.create({
      userId,
      name: name.trim(),
      emoji: emoji || "📝",
      color: color || "#6366F1",
    });

    return NextResponse.json(
      { message: "Category created successfully", category: newCategory },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("POST category error:", err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : "An unknown error occurred") || "Failed to create category" }, { status: 500 });
  }
}