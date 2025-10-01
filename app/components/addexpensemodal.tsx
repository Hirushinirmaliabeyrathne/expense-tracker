"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAddExpense: (expense: ExpenseData) => Promise<void>
  categories: Array<{ name: string; color?: string }> 
  onAddCategory: (categoryName: string) => Promise<void> 
}

export interface ExpenseData {
  amount: number
  date: string
  category: string
  emoji: string
  description: string
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  onAddExpense,
  categories,
  onAddCategory,
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseData>({
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: "",
    emoji: "💰",
    description: "",
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState("") 
  const emojiPickerRef = useRef<HTMLDivElement>(null) 

 
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        category: "",
        emoji: "",
        description: "",
      })
      setNewCategoryInput("") 
    }
  }, [isOpen])

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

 
  const handleSelectCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, category: value }))
    setNewCategoryInput(value) 
  }

  const handleNewCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewCategoryInput(value)
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === value.toLowerCase());
    if (existingCategory) {
        setFormData((prev) => ({ ...prev, category: existingCategory.name }));
    } else {
        setFormData((prev) => ({ ...prev, category: value })); 
    }
  }

  // Handle explicit "Add" button click for new categories
  const handleAddCategoryClick = async () => {
    if (newCategoryInput.trim() && !categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())) {
      setIsSubmitting(true)
      try {
        await onAddCategory(newCategoryInput.trim())
        setFormData((prev) => ({ ...prev, category: newCategoryInput.trim() })) 
    
      } catch (error) {
        console.error("Failed to add new category:", error)
        alert("Failed to add category. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    } else if (categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())) {
        alert(`Category "${newCategoryInput.trim()}" already exists.`);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let finalCategory = formData.category.trim();

    if (newCategoryInput.trim() && !categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())) {
      setIsSubmitting(true); 
      try {
        await onAddCategory(newCategoryInput.trim()); 
        finalCategory = newCategoryInput.trim(); 
      } catch (error) {
        console.error("Failed to add new category during expense submission:", error);
        alert("Failed to add category and expense. Please try again.");
        setIsSubmitting(false);
        return; 
      }
    } else if (newCategoryInput.trim() && categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())) {
        finalCategory = categories.find(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())?.name || finalCategory;
    }


    if (formData.amount > 0 && finalCategory && formData.description.trim()) {
      try {
        setIsSubmitting(true)
        await onAddExpense({ ...formData, category: finalCategory }) 
        setFormData({
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          category: "",
          emoji: "",
          description: "",
        })
        setNewCategoryInput("") 
        onClose()
      } catch (error) {
        console.error("Failed to add expense:", error)
        alert("Failed to add expense. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      alert("Please ensure Amount is greater than 0, Category is selected/added, and Description is provided.")
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setFormData((prev) => ({ ...prev, emoji: emojiData.emoji }))
    setShowEmojiPicker(false)
  }

  const isAddCategoryButtonDisabled = isSubmitting || !newCategoryInput.trim() || categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase());
  const isSubmitButtonDisabled = isSubmitting || formData.amount <= 0 || !formData.description.trim() || !formData.category.trim();


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
              value={formData.amount === 0 ? "" : formData.amount} // Display empty for 0
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number.parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571]"
              placeholder="0.00"
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          {/* Category Field - Dropdown AND New Category Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={handleSelectCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571] mb-2"
              required
              disabled={isSubmitting}
            >
              <option value="">Select an existing category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={handleNewCategoryInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571]"
                placeholder="Type to add new or select existing"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddCategoryClick}
                className="px-3 py-2 bg-[#001571] text-white rounded-lg hover:bg-[#001571]/90 transition disabled:opacity-50"
                disabled={isAddCategoryButtonDisabled}
              >
                Add
              </button>
            </div>
            {newCategoryInput.trim() && !categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase()) &&
              <p className="text-xs text-gray-500 mt-1">
                New category: &quot;{newCategoryInput.trim()}&quot;. Click &quot;Add&quot; to save, or it will be added with the expense.
              </p>
            }
            {newCategoryInput.trim() && categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase()) &&
              <p className="text-xs text-gray-500 mt-1 text-green-700">
                &quot;{newCategoryInput.trim()}&quot; is an existing category.
              </p>
            }
          </div>

          {/* Emoji Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
            <div className="relative" ref={emojiPickerRef}> {/* Attach ref here */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001571] text-left flex items-center gap-2"
                disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#001571] text-white rounded-lg hover:bg-[#001571]/90 transition disabled:opacity-50"
              disabled={isSubmitButtonDisabled}
            >
              {isSubmitting ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}