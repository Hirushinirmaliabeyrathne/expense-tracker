"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAddExpense: (expense: ExpenseData) => Promise<void>
  categories: Array<{ name: string; color?: string }> // Include color for consistency with useCategories
  onAddCategory: (categoryName: string) => Promise<void> // New prop for adding categories
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
  const [newCategoryInput, setNewCategoryInput] = useState("") // State for the text input for new categories
  const emojiPickerRef = useRef<HTMLDivElement>(null) // Ref for emoji picker to detect clicks outside

  // Reset form data and category input when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        category: "",
        emoji: "💰",
        description: "",
      })
      setNewCategoryInput("") // Clear new category input on open
    }
  }, [isOpen])

  // Effect to close emoji picker when clicking outside
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

  // Handles change from the <select> dropdown
  const handleSelectCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, category: value }))
    setNewCategoryInput(value) // Also update the text input to reflect selection
  }

  // Handles change from the <input type="text"> for new categories
  const handleNewCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewCategoryInput(value)
    // If the user types, it clears the selected category from the dropdown conceptually
    // However, formData.category is the one sent, so we update it here if it's a new input.
    // If the typed value matches an existing category, we set formData.category to that existing one.
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === value.toLowerCase());
    if (existingCategory) {
        setFormData((prev) => ({ ...prev, category: existingCategory.name }));
    } else {
        setFormData((prev) => ({ ...prev, category: value })); // Set formData.category to the typed value
    }
  }

  // Handle explicit "Add" button click for new categories
  const handleAddCategoryClick = async () => {
    if (newCategoryInput.trim() && !categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())) {
      setIsSubmitting(true)
      try {
        await onAddCategory(newCategoryInput.trim())
        setFormData((prev) => ({ ...prev, category: newCategoryInput.trim() })) // Set the newly added category
        // No need to clear newCategoryInput, it should reflect the now-selected new category
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

    // Final check for category before submitting the expense
    let finalCategory = formData.category.trim();

    // If the user typed a new category in the input field but didn't click "Add"
    // and it doesn't exist, we'll try to add it now as part of the expense submission.
    if (newCategoryInput.trim() && !categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())) {
      setIsSubmitting(true); // Indicate submission in progress
      try {
        await onAddCategory(newCategoryInput.trim()); // Add the new category
        finalCategory = newCategoryInput.trim(); // Use the newly added category
      } catch (error) {
        console.error("Failed to add new category during expense submission:", error);
        alert("Failed to add category and expense. Please try again.");
        setIsSubmitting(false);
        return; // Stop submission if category addition fails
      }
    } else if (newCategoryInput.trim() && categories.some(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())) {
        // If they typed an existing category, ensure finalCategory reflects the canonical name if needed
        finalCategory = categories.find(cat => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())?.name || finalCategory;
    }


    if (formData.amount > 0 && finalCategory && formData.description.trim()) {
      try {
        setIsSubmitting(true)
        await onAddExpense({ ...formData, category: finalCategory }) // Use the potentially updated finalCategory
        // Reset form after successful submission
        setFormData({
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          category: "",
          emoji: "💰",
          description: "",
        })
        setNewCategoryInput("") // Clear category input
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