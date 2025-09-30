import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Expense from "@/models/Expense"
import { verifyAuth } from "@/lib/auth-middleware"

// GET - Fetch all expenses for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await verifyAuth(request)
    if (error) return error

    await connectDB()

    // Fetch expenses sorted by date (newest first)
    const expenses = await Expense.find({ userId }).sort({ date: -1, createdAt: -1 }).lean()

    return NextResponse.json({ expenses }, { status: 200 })
  } catch (error) {
    console.error("GET expenses error:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

// POST - Create new expense
export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await verifyAuth(request)
    if (error) return error

    const body = await request.json()
    const { amount, date, category, emoji, description } = body

    // Validation
    if (!amount || !date || !category || !description) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    await connectDB()

    const newExpense = await Expense.create({
      userId,
      amount,
      date: new Date(date),
      category,
      emoji: emoji || "💰",
      description,
    })

    return NextResponse.json({ message: "Expense created successfully", expense: newExpense }, { status: 201 })
  } catch (error) {
    console.error("POST expense error:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
