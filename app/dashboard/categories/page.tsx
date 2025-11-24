"use client";
import { useState } from "react";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddCategoryModal from "../../components/AddCategoryModal";
import { useCategories } from "../../hooks/use-categories";
import { useExpenses } from "../../hooks/use-expenses";
import { Category, Expense } from "../../types";

export const colorOptions = [
  "#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6",
  "#8B5CF6", "#EF4444", "#14B8A6", "#F97316", "#06B6D4",
  "#84CC16", "#A855F7",
];

export default function CategoriesPage() {
  const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useCategories();
  const expensesData = useExpenses();
  const rawExpenses: Expense[] = expensesData?.expenses || [];

  // --- REAL WORLD FIX: Calculate Stats ---
  // 1. Get list of currently active category names
  const activeCategoryNames = categories.map(c => c.name);

  // 2. Filter expenses to only show ones that belong to active categories.
  // This ensures that when you delete a category, the "Total Amount" card updates immediately.
  const activeExpenses = rawExpenses.filter(exp => activeCategoryNames.includes(exp.category));

  const totalCategories = categories.length;
  // Use activeExpenses instead of rawExpenses for the cards
  const totalExpenses = activeExpenses.length;
  const totalAmount = activeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  // ----------------------------------------

  const cards = [
    { title: "Total Categories", value: totalCategories.toString(), desc: "Active categories" },
    { title: "Total Expenses", value: totalExpenses.toString(), desc: "Across active categories" },
    { title: "Total Amount", value: `$${totalAmount.toFixed(2)}`, desc: "All time spending" },
  ];

  // State for Edit/Add modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({ name: "", emoji: "", color: "" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddCategory = async (newCategoryData: { name: string; emoji: string; color: string }) => {
    try {
      setError(null);
      await addCategory(newCategoryData);
      setIsModalOpen(false);
      setSuccessMessage("Category added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      // Pass error to modal
      throw err; 
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditForm({ name: category.name, emoji: category.emoji, color: category.color });
    setIsEditModalOpen(true);
    setError(null);
  };
const handleUpdateCategory = async () => {
    if (editingCategory) {
      try {
        setError(null);
        await updateCategory(editingCategory._id, editForm);
        
        // FIX: Change 'refreshExpenses' to 'refetch'
        if (expensesData?.refetch) expensesData.refetch(); 

        setIsEditModalOpen(false);
        setEditingCategory(null);
        setSuccessMessage("Category updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update category";
        setError(errorMessage);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Are you sure? This will delete all expenses in this category.")) {
      try {
        setError(null);
        await deleteCategory(categoryId);
        
        // FIX: Change 'refreshExpenses' to 'refetch'
        if (expensesData?.refetch) expensesData.refetch();

        setSuccessMessage("Category and related expenses deleted!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete category";
        setError(errorMessage);
      }
    }
  };
  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setEditForm({ ...editForm, emoji: emojiData.emoji });
    setShowEmojiPicker(false);
  };

  const categoriesWithStats = categories.map((category) => {
    // Filter expenses specific to this category
    const categoryExpenses = activeExpenses.filter((exp: Expense) => exp.category === category.name);
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
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">✕</button>
        </div>
      )}

      {/* Error Message */}
      {error && !isModalOpen && !isEditModalOpen && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="px-10 py-4">
          <h1 className="text-2xl font-bold">Expense Categories</h1>
          <p className="text-gray-600">Manage your expense categories and track spending patterns</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setError(null);
          }}
          className="px-4 py-2 bg-[#001571] text-white rounded-lg flex items-center gap-2"
        >
          <AddCircleOutlineRoundedIcon />
          Add Category
        </button>
      </div>

      {/* Stats Cards - Now using Dynamic Data */}
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
        <div className="text-center text-gray-500 py-8">No categories found. Add your first category!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithStats.map((category) => (
            <div key={category._id} className="bg-white p-6 rounded-xl shadow-sm relative group">
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

      {/* Add Modal */}
      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCategory={handleAddCategory}
        colorOptions={colorOptions}
      />

      {/* Edit Modal - Kept same as your code */}
{isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button 
                onClick={() => { setIsEditModalOpen(false); setError(null); }} 
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <span className="text-red-600 text-sm">⚠️</span>
                <p className="text-red-600 text-sm flex-1">{error}</p>
              </div>
            )}

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category Name</label>
              <input 
                type="text" 
                value={editForm.name} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            {/* Emoji Picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Emoji</label>
              <div 
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-300" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <span className="text-2xl">{editForm.emoji || "😀"}</span>
                <span className="text-gray-500 text-sm">Click to change</span>
              </div>
              {showEmojiPicker && (
                <div className="mt-2 relative z-10">
                  <EmojiPicker onEmojiClick={handleEmojiSelect} width="100%" height={350} />
                </div>
              )}
            </div>

            {/* Color Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((color) => (
                  <button 
                    key={color} 
                    onClick={() => setEditForm({ ...editForm, color })} 
                    className={`w-8 h-8 rounded-full border-2 ${editForm.color === color ? "border-gray-800" : "border-transparent"}`} 
                    style={{ backgroundColor: color }} 
                    type="button" 
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => { setIsEditModalOpen(false); setError(null); }} 
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateCategory} 
                className="flex-1 px-4 py-2 bg-[#001571] text-white rounded-lg hover:opacity-90"
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