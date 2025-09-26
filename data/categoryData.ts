export interface Category {
  id: number
  name: string
  emoji: string
  color: string
  expenses: number
  totalSpent: number
  percentage: number
}

export const colorOptions = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
  "#F97316",
  "#3B82F6",
  "#EC4899",
  "#22C55E",
  "#EAB308",
  "#F472B6",
]

export const defaultCategories: Category[] = [
  { id: 1, name: "Food", emoji: "🍽️", color: "#6366F1", expenses: 12, totalSpent: 245.5, percentage: 16.9 },
  { id: 2, name: "Transportation", emoji: "🚗", color: "#10B981", expenses: 8, totalSpent: 320.0, percentage: 22.0 },
  { id: 3, name: "Entertainment", emoji: "🎬", color: "#F59E0B", expenses: 5, totalSpent: 125.99, percentage: 8.7 },
  { id: 4, name: "Shopping", emoji: "🛍️", color: "#EF4444", expenses: 15, totalSpent: 489.99, percentage: 33.6 },
  { id: 5, name: "Utilities", emoji: "💡", color: "#06B6D4", expenses: 3, totalSpent: 180.0, percentage: 12.4 },
  { id: 6, name: "Healthcare", emoji: "🏥", color: "#8B5CF6", expenses: 2, totalSpent: 95.0, percentage: 6.5 },
]

export const generateCategoryId = (categories: Category[]): number => {
  return Math.max(...categories.map((cat) => cat.id), 0) + 1
}
