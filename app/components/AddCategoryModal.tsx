"use client";

import { useState, useEffect, useRef } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: { name: string; emoji: string; color: string }) => Promise<void>;
  colorOptions: string[];
}

export default function AddCategoryModal({ isOpen, onClose, onAddCategory, colorOptions }: AddCategoryModalProps) {
  const [form, setForm] = useState({ name: "", emoji: "📝", color: "#6366F1" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Feature added: Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({ name: "", emoji: "📝", color: "#6366F1" });
      setShowEmojiPicker(false);
      setError(null);
    }
  }, [isOpen]);

  // Feature added: Handle clicking outside the emoji picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setForm({ ...form, emoji: emojiData.emoji });
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if (form.name.trim()) {
      try {
        setIsSubmitting(true);
        setError(null);
        await onAddCategory(form);
        
        // On success: reset and close
        setForm({ name: "", emoji: "📝", color: "#6366F1" });
        setShowEmojiPicker(false);
        onClose();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add category.";
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setForm({ name: "", emoji: "📝", color: "#6366F1" });
    setShowEmojiPicker(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Feature added: max-h and overflow-y-auto for better responsiveness */}
      <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Category</h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">Create a new expense category to organize your spending.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-600 text-sm">⚠️</span>
            <p className="text-red-600 text-sm flex-1">{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="text-red-400 hover:text-red-600"
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Category Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (error) setError(null);
            }}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category name"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Emoji</label>
          {/* Feature added: ref and relative positioning for the floating picker */}
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-left"
              onClick={() => !isSubmitting && setShowEmojiPicker(!showEmojiPicker)}
              disabled={isSubmitting}
            >
              <span className="text-2xl">{form.emoji}</span>
              <span className="text-gray-500">Click to choose emoji</span>
            </button>

            {/* Feature added: Absolute positioning for the picker */}
            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-10 mt-1">
                <EmojiPicker onEmojiClick={handleEmojiSelect} width={300} height={350} />
              </div>
            )}
          </div>
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
                disabled={isSubmitting}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-[#001571] text-white rounded-lg hover:bg-[#001571]/90 disabled:opacity-50"
            disabled={!form.name.trim() || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}