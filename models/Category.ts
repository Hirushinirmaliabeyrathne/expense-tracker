import mongoose from "mongoose"

export interface ICategory {
  id: number
  name: string
  emoji: string
  color: string
  expenses: number
  totalSpent: number
  percentage: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    emoji: {
      type: String,
      required: [true, "Category emoji is required"],
    },
    color: {
      type: String,
      required: [true, "Category color is required"],
      match: [/^#[0-9A-F]{6}$/i, "Please enter a valid hex color"],
    },
    expenses: {
      type: Number,
      default: 0,
      min: [0, "Expenses count cannot be negative"],
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, "Total spent cannot be negative"],
    },
    percentage: {
      type: Number,
      default: 0,
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100"],
    },
    userId: {
      type: String,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  },
)

categorySchema.index({ userId: 1 })

export const colorOptions = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
]

export const defaultCategoriesTemplate = [
  {
    name: "Food & Dining",
    emoji: "🍽️",
    color: "#FF6B6B",
    expenses: 0,
    totalSpent: 0,
    percentage: 0,
  },
  {
    name: "Transportation",
    emoji: "🚗",
    color: "#4ECDC4",
    expenses: 0,
    totalSpent: 0,
    percentage: 0,
  },
  {
    name: "Shopping",
    emoji: "🛍️",
    color: "#45B7D1",
    expenses: 0,
    totalSpent: 0,
    percentage: 0,
  },
  {
    name: "Entertainment",
    emoji: "🎬",
    color: "#96CEB4",
    expenses: 0,
    totalSpent: 0,
    percentage: 0,
  },
  {
    name: "Healthcare",
    emoji: "🏥",
    color: "#FFEAA7",
    expenses: 0,
    totalSpent: 0,
    percentage: 0,
  },
  {
    name: "Utilities",
    emoji: "💡",
    color: "#DDA0DD",
    expenses: 0,
    totalSpent: 0,
    percentage: 0,
  },
]

export function generateCategoryId(existingCategories: ICategory[]): string {
  if (!existingCategories || existingCategories.length === 0) {
    return "1"
  }
  
  const maxId = Math.max(...existingCategories.map(cat => cat.id || 0))
  return (maxId + 1).toString()
}

export async function createDefaultCategoriesForUser(userId: string): Promise<ICategory[]> {
  // Ensure mongoose is connected before using models
  if (mongoose.connection.readyState === 0) {
    throw new Error("Database not connected")
  }

  const Category = getCategoryModel()
  
  const defaultCategories = defaultCategoriesTemplate.map((cat, index) => ({
    ...cat,
    id: index + 1,
    userId,
  }))

  return await Category.insertMany(defaultCategories)
}

// Helper function to safely get the model
function getCategoryModel() {
  if (mongoose.models.Category) {
    return mongoose.models.Category as mongoose.Model<ICategory>
  }
  return mongoose.model<ICategory>("Category", categorySchema)
}

// Export the model getter function instead of direct model
export { getCategoryModel }

// For backwards compatibility, also export the model directly
// but wrapped in a try-catch to prevent errors
let CategoryModel: mongoose.Model<ICategory> | null = null

try {
  CategoryModel = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema)
} catch (error) {
  console.warn("Could not initialize Category model:", error)
}

export default CategoryModel