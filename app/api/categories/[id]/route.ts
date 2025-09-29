import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { ICategory } from "../../../../models/Category"
import { Category } from "@/data/categoryData"

// PUT - Update category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, emoji, color } = body
    const categoryId = Number.parseInt(params.id)

    if (!name || !emoji || !color) {
      return NextResponse.json({ success: false, error: "Name, emoji, and color are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("expense_tracker")

    const updateData = {
      name,
      emoji,
      color,
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").updateOne({ id: categoryId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    const updatedCategory = await db.collection<ICategory>("categories").findOne({ id: categoryId })
    return NextResponse.json({ success: true, data: updatedCategory })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = Number.parseInt(params.id)

    const client = await clientPromise
    const db = client.db("expense_tracker")

    const result = await db.collection("categories").deleteOne({ id: categoryId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
  }
}
