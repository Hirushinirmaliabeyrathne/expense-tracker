import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Category from "../../../models/Category";
import { verifyAuth } from "../../../lib/auth-middleware";

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

    // 1. Check for Duplicate (Case Insensitive for better UX)
    const existingCategory = await Category.findOne({ 
      userId, 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingCategory) {
      // This error message will be caught by your AddCategoryModal
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
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await verifyAuth(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    await connectDB();
    const categories = await Category.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ categories }, { status: 200 });
  } catch (err: unknown) {
    console.error("GET categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}