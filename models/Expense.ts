import mongoose, { Schema, type Document } from "mongoose"

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId
  amount: number
  date: Date
  category: string
  emoji: string
  description: string
  createdAt: Date
  updatedAt: Date
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
      default: "💰",
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
ExpenseSchema.index({ userId: 1, date: -1 })

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema)
