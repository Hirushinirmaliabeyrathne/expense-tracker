"use client";
import { useState } from "react";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddCategoryModal from "../../components/AddCategoryModal";
import { useCategories } from "../../hooks/use-categories";
import { useExpenses } from "../../hooks/use-expenses";

export const colorOptions = [
  "#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6",
  "#8B5CF6", "#EF4444", "#14B8A6", "#F97316", "#06B6D4",
  "#84CC16", "#A855F7",
];

interface Category {
  _id: string;
  name: string;
  emoji: string;
  color: string;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  emoji: string;
}

export default function CategoriesPage() {
  const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useCategories();
  const { expenses } = useExpenses() as { expenses: Expense[] };

  const totalCategories = categories.length;
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const cards = [
    { title: "Total Categories", value: totalCategories.toString(), desc: "Active categories" },
    { title: "Total Expenses", value: totalExpenses.toString(), desc: "Across all categories" },
    { title: "Total Amount", value: `$${totalAmount.toFixed(2)}`, desc: "All time spending" },
  ];

   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({ name: "", emoji: "", color: "" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

   const handleAddCategory = async (newCategoryData: { name: string; emoji: string; color: string }) => {
    try {
      await addCategory(newCategoryData);
      setIsModalOpen(false);
    } catch (err: unknown) { // Corrected
      alert((err as Error).message || "Failed to add category"); // Corrected
    }
  };

   const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditForm({ name: category.name, emoji: category.emoji, color: category.color });
    setIsEditModalOpen(true);
  };

   const handleUpdateCategory = async () => {
    if (editingCategory) {
      try {
        await updateCategory(editingCategory._id, editForm);
        setIsEditModalOpen(false);
        setEditingCategory(null);
      } catch (err: unknown) { // Corrected
        alert((err as Error).message || "Failed to update category"); // Corrected
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(categoryId);
      } catch (err: unknown) { // Corrected
        alert((err as Error).message || "Failed to delete category"); // Corrected
      }
    }
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setEditForm({ ...editForm, emoji: emojiData.emoji });
    setShowEmojiPicker(false);
  };

  const categoriesWithStats = categories.map((category) => {
    const categoryExpenses = expenses.filter((exp: Expense) => exp.category === category.name);
    const categoryTotal = categoryExpenses.reduce((sum, exp: Expense) => sum + exp.amount, 0);
    const percentage = totalAmount > 0 ? (categoryTotal / totalAmount) * 100 : 0;

    return {
      ...category,
      expenses: categoryExpenses.length,
      totalSpent: categoryTotal,
      percentage: percentage.toFixed(1),
    };
  });

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.desc}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading categories...</div>
      ) : categoriesWithStats.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No categories yet. Add your first category!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithStats.map((category) => (
            <div key={category._id} className="bg-white p-6 rounded-xl shadow-sm relative group">
              {/* Edit/Delete */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditCategory(category)} className="text-gray-400 hover:text-blue-600 mr-2">
                  <EditIcon />
                </button>
                <button onClick={() => handleDeleteCategory(category._id)} className="text-gray-400 hover:text-red-600">
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
                  <span className="font-bold text-lg">${category.totalSpent.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: category.color,
                      width: `${Math.min(Number(category.percentage), 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{category.percentage}% of total spending</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Emoji</label>
              <div
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-300"
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
                    className={`w-8 h-8 rounded-full ${
                      editForm.color === color ? "ring-2 ring-offset-2 ring-blue-500" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-300"
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
  );
}