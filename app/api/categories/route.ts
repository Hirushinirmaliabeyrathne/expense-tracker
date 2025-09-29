import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { type ICategory, generateCategoryId } from "../../../models/Category"

// GET - Fetch all categories
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("expense_tracker")
    const categories = await db.collection<ICategory>("categories").find({}).toArray()

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, emoji, color } = body

    if (!name || !emoji || !color) {
      return NextResponse.json({ success: false, error: "Name, emoji, and color are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("expense_tracker")

    // Get existing categories to generate new ID
    const existingCategories = await db.collection<ICategory>("categories").find({}).toArray()
    const newId = parseInt(generateCategoryId(existingCategories))

    // Use ICategory interface instead of Category type
    const newCategory: ICategory = {
      id: newId,
      name,
      emoji,
      color,
      expenses: 0,
      totalSpent: 0,
      percentage: 0,
      userId: "temp-user-id", // You'll need to get this from auth context
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").insertOne(newCategory)

    if (result.insertedId) {
      const insertedCategory = await db.collection<ICategory>("categories").findOne({ _id: result.insertedId })
      return NextResponse.json({ success: true, data: insertedCategory })
    } else {
      throw new Error("Failed to insert category")
    }
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
  }
}