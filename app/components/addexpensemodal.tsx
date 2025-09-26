"use client"

import type React from "react"

import { useState } from "react"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAddExpense: (expense: ExpenseData) => void
}

export interface ExpenseData {
  amount: number
  date: string
  category: string
  emoji: string
  description: string
}

export default function AddExpenseModal({ isOpen, onClose, onAddExpense }: AddExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseData>({
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: "",
    emoji: "💰",
    description: "",
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const categories = ["Food", "Transportation", "Entertainment", "Shopping", "Healthcare", "Bills", "Other"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount > 0 && formData.category && formData.description) {
      onAddExpense(formData)
      setFormData({
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        category: "",
        emoji: "💰",
        description: "",
      })
      onClose()
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setFormData((prev) => ({ ...prev, emoji: emojiData.emoji }))
    setShowEmojiPicker(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number.parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571]"
              placeholder="0.00"
              required
            />
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571]"
              required
            />
          </div>

          {/* Category Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571]"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Emoji Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571] text-left flex items-center gap-2"
              >
                <span className="text-2xl">{formData.emoji}</span>
                <span className="text-gray-500">Click to change emoji</span>
              </button>

              {showEmojiPicker && (
                <div className="absolute top-full left-0 z-10 mt-1">
                  <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571]"
              placeholder="Enter expense description"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#001571] text-white rounded-lg hover:bg-[#001571]/90 transition"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
