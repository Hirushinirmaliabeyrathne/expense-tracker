// data/analyticsCalculations.ts

import { Expense, Category, CategorySummary, FilterPeriod } from "@/app/types";


export function calculateSummaryStats(
  filteredExpenses: Expense[],
  categories: Category[],
  selectedFilter: FilterPeriod,
) {
  const totalSpending = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  const numMonths =
    selectedFilter === "thisYear" || selectedFilter === "lastYear"
      ? 12
      : selectedFilter === "all"
        ? Math.max(1, new Set(filteredExpenses.map((exp) => new Date(exp.date).getMonth())).size)
        : 1
  const monthlyAverage = totalSpending / numMonths

  const numDays = filteredExpenses.length > 0 ? new Set(filteredExpenses.map((exp) => exp.date.split('T')[0])).size : 1;
  const dailyAverage = totalSpending / numDays


  const categoryTotals = filteredExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  const topCategoryName = topCategory?.[0] || "N/A"
  const topCategoryAmount = topCategory?.[1] || 0

  const categoryData: CategorySummary[] = Object.entries(categoryTotals).map(([name, value]) => {
    const cat = categories.find((c) => c.name === name)
    const percentage = totalSpending > 0 ? ((value / totalSpending) * 100).toFixed(1) : "0.0"
    return {
      label: name,
      value,
      color: cat?.color || "#6B7280",
      percentage: `${percentage}%`,
    }
  })

  return {
    totalSpending,
    monthlyAverage,
    dailyAverage,
    topCategoryName,
    topCategoryAmount,
    categoryData,
  }
}