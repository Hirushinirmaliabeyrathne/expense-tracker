// Expense data types and utilities
export interface Expense {
  id: string
  amount: number
  date: string
  category: string
  emoji: string
  description: string
  createdAt: Date
}

export const defaultExpenses: Expense[] = [
  {
    id: "1",
    amount: 45.5,
    date: "2024-01-15",
    category: "Food",
    emoji: "🍽️",
    description: "Lunch at restaurant",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    amount: 120,
    date: "2024-01-14",
    category: "Transportation",
    emoji: "⛽",
    description: "Gas for car",
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    amount: 25.99,
    date: "2024-01-13",
    category: "Entertainment",
    emoji: "🎬",
    description: "Movie tickets",
    createdAt: new Date("2024-01-13"),
  },
  {
    id: "4",
    amount: 89.99,
    date: "2024-01-12",
    category: "Shopping",
    emoji: "🛍️",
    description: "Clothes",
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    amount: 15.5,
    date: "2024-01-11",
    category: "Food",
    emoji: "☕",
    description: "Coffee",
    createdAt: new Date("2024-01-11"),
  },
]

export const categoryColors: Record<string, string> = {
  Food: "#6366F1",
  Transportation: "#10B981",
  Entertainment: "#F59E0B",
  Shopping: "#EF4444",
  Healthcare: "#8B5CF6",
  Bills: "#06B6D4",
  Other: "#6B7280",
}

export function generateExpenseId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
