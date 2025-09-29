"use client"
import { useState, useEffect } from "react"
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"
import EditIcon from "@mui/icons-material/Edit"
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded"
import AddCategoryModal from "../../components/AddCategoryModal"
import { type ICategory, colorOptions } from "../../../models/Category"
import { useToast } from "../../hooks/use-toast"

export default function CategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null)
  const [editForm, setEditForm] = useState({ name: "", emoji: "", color: "" })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (newCategoryData: { name: string; emoji: string; color: string }) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategoryData),
      })

      const result = await response.json()

      if (result.success) {
        setCategories([...categories, result.data])
        toast({
          title: "Success",
          description: "Category added successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add category",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = (category: ICategory) => {
    setEditingCategory(category)
    setEditForm({ name: category.name, emoji: category.emoji, color: category.color })
    setIsEditModalOpen(true)
  }

  const handleUpdateCategory = async () => {
    if (editingCategory) {
      try {
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        })

        const result = await response.json()

        if (result.success) {
          setCategories(categories.map((cat) => (cat.id === editingCategory.id ? result.data : cat)))
          setIsEditModalOpen(false)
          setEditingCategory(null)
          toast({
            title: "Success",
            description: "Category updated successfully!",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update category",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error updating category:", error)
        toast({
          title: "Error",
          description: "Failed to update category",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setCategories(categories.filter((cat) => cat.id.toString() !== categoryId.toString()))
        toast({
          title: "Success",
          description: "Category deleted successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete category",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setEditForm({ ...editForm, emoji: emojiData.emoji })
    setShowEmojiPicker(false)
  }

  const cards = [
    { title: "Total Categories", value: categories.length.toString(), desc: "Active categories" },
    {
      title: "Total Expenses",
      value: categories.reduce((sum, cat) => sum + cat.expenses, 0).toString(),
      desc: "Across all categories",
    },
    {
      title: "Total Amount",
      value: `$${categories.reduce((sum, cat) => sum + cat.totalSpent, 0).toFixed(2)}`,
      desc: "All time spending",
    },
  ]

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="px-10 py-4">
          <h1 className="text-2xl font-bold">Expense Categories</h1>
          <p className="text-gray-600">Manage your expense categories and track spending patterns</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#001571] text-white rounded-lg flex items-center gap-2"
        >
          <AddCircleOutlineRoundedIcon />
          Add Category
        </button>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-xl shadow-sm relative group">
            {/* Edit/Delete buttons */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditCategory(category)} className="text-gray-400 hover:text-blue-600 mr-2">
                <EditIcon />
              </button>
              <button onClick={() => handleDeleteCategory(category.id.toString())} className="text-gray-400 hover:text-red-600">
                <DeleteRoundedIcon />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                {category.emoji}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.expenses} expenses</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="font-bold text-lg">${category.totalSpent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: category.color,
                    width: `${Math.min(category.percentage, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{category.percentage}% of total spending</p>
            </div>
          </div>
        ))}
      </div>

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCategory={handleAddCategory}
        colorOptions={colorOptions}
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-4">Update the details of your expense category.</p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Emoji</label>
              <div
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <span className="text-2xl">{editForm.emoji || "😀"}</span>
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
                    onClick={() => setEditForm({ ...editForm, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      editForm.color === color ? "border-gray-800" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
