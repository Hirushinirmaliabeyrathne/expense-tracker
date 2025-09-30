import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Expense from "@/models/Expense"
import { verifyAuth } from "@/lib/auth-middleware"
import mongoose from "mongoose"

// PUT - Update expense
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, error } = await verifyAuth(request)
    if (error) return error

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 })
    }

    const body = await request.json()
    const { amount, date, category, emoji, description } = body

    await connectDB()

    // Find expense and verify ownership
    const expense = await Expense.findOne({ _id: id, userId })

    if (!expense) {
      return NextResponse.json({ error: "Expense not found or unauthorized" }, { status: 404 })
    }

    // Update fields
    if (amount !== undefined) expense.amount = amount
    if (date !== undefined) expense.date = new Date(date)
    if (category !== undefined) expense.category = category
    if (emoji !== undefined) expense.emoji = emoji
    if (description !== undefined) expense.description = description

    await expense.save()

    return NextResponse.json({ message: "Expense updated successfully", expense }, { status: 200 })
  } catch (error) {
    console.error("PUT expense error:", error)
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
  }
}

// DELETE - Delete expense
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, error } = await verifyAuth(request)
    if (error) return error

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 })
    }

    await connectDB()

    // Find and delete expense (only if owned by user)
    const deletedExpense = await Expense.findOneAndDelete({ _id: id, userId })

    if (!deletedExpense) {
      return NextResponse.json({ error: "Expense not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ message: "Expense deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("DELETE expense error:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
