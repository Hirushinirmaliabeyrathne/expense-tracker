"use client"
import { useState } from "react"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCategory: (categoryData: { name: string; emoji: string; color: string }) => void
  colorOptions: string[]
}

export default function AddCategoryModal({ isOpen, onClose, onAddCategory, colorOptions }: AddCategoryModalProps) {
  const [form, setForm] = useState({ name: "", emoji: "😀", color: colorOptions[0] })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleSubmit = () => {
    if (form.name.trim()) {
      onAddCategory(form)
      setForm({ name: "", emoji: "😀", color: colorOptions[0] })
      setShowEmojiPicker(false)
      onClose()
    }
  }

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setForm({ ...form, emoji: emojiData.emoji })
    setShowEmojiPicker(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">Create a new expense category to organize your spending.</p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Category Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border rounded-lg"
            placeholder="Enter category name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Emoji</label>
          <div
            className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <span className="text-2xl">{form.emoji}</span>
            <span className="text-gray-500">Click to choose emoji</span>
          </div>
          {showEmojiPicker && (
            <div className="mt-2 relative">
              <EmojiPicker onEmojiClick={handleEmojiSelect} width={350} height={400} />
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="grid grid-cols-6 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setForm({ ...form, color })}
                className={`w-8 h-8 rounded-full border-2 ${
                  form.color === color ? "border-gray-800" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            Add Category
          </button>
        </div>
      </div>
    </div>
  )
}
