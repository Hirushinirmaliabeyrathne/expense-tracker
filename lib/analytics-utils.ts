// Utility functions to generate analytics data from real expenses

export interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  date: string
  emoji: string
}

export interface Category {
  _id: string
  name: string
  emoji: string
  color: string
}

export type FilterPeriod = "thisMonth" | "lastMonth" | "thisYear" | "lastYear" | "all"

// Helper to filter expenses by period
export function filterExpensesByPeriod(expenses: Expense[], period: FilterPeriod): Expense[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const expenseYear = expenseDate.getFullYear()
    const expenseMonth = expenseDate.getMonth()

    switch (period) {
      case "thisMonth":
        return expenseYear === currentYear && expenseMonth === currentMonth
      case "lastMonth":
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return expenseYear === lastMonthYear && expenseMonth === lastMonth
      case "thisYear":
        return expenseYear === currentYear
      case "lastYear":
        return expenseYear === currentYear - 1
      case "all":
      default:
        return true
    }
  })
}

// Generate spending by category chart data
export function generateSpendingByCategory(expenses: Expense[], categories: Category[]) {
  const categoryTotals: Record<string, number> = {}

  expenses.forEach((expense) => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
  })

  const labels = Object.keys(categoryTotals)
  const values = Object.values(categoryTotals)
  const colors = labels.map((catName) => {
    const cat = categories.find((c) => c.name === catName)
    return cat?.color || "#6B7280"
  })

  return {
    labels,
    datasets: [
      {
        label: "Expenses",
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  }
}

// Generate monthly trend data
export function generateMonthlyTrend(expenses: Expense[], period: FilterPeriod) {
  const now = new Date()
  const monthlyData: Record<string, number> = {}

  if (period === "thisMonth" || period === "lastMonth") {
    // Weekly breakdown for month view
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
    weeks.forEach((week) => (monthlyData[week] = 0))

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      const day = expenseDate.getDate()
      const weekIndex = Math.floor((day - 1) / 7)
      const weekLabel = weeks[Math.min(weekIndex, 3)]
      monthlyData[weekLabel] += expense.amount
    })
  } else {
    // Monthly breakdown for year view
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    months.forEach((month) => (monthlyData[month] = 0))

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      const monthLabel = months[expenseDate.getMonth()]
      monthlyData[monthLabel] += expense.amount
    })
  }

  return {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: "Spending",
        data: Object.values(monthlyData),
        backgroundColor: "#6366F1",
        borderColor: "#6366F1",
        fill: true,
        tension: 0.4,
      },
    ],
  }
}

// Generate daily pattern data
export function generateDailyPattern(expenses: Expense[], period: FilterPeriod) {
  const dailyData: Record<string, number> = {}

  if (period === "thisYear" || period === "lastYear") {
    // Monthly pattern for year view
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    months.forEach((month) => (dailyData[month] = 0))

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      const monthLabel = months[expenseDate.getMonth()]
      dailyData[monthLabel] += expense.amount
    })
  } else {
    // Daily pattern for month view
    const daysInMonth = period === "thisMonth" ? new Date().getDate() : 30
    for (let i = 1; i <= daysInMonth; i++) {
      dailyData[i.toString()] = 0
    }

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      const day = expenseDate.getDate().toString()
      if (dailyData[day] !== undefined) {
        dailyData[day] += expense.amount
      }
    })
  }

  return {
    labels: Object.keys(dailyData),
    datasets: [
      {
        label: "Daily Spending",
        data: Object.values(dailyData),
        backgroundColor: "#6366F1",
      },
    ],
  }
}

// Generate category trends over time
export function generateCategoryTrends(expenses: Expense[], categories: Category[], period: FilterPeriod) {
  const timeLabels: string[] = []
  const categoryData: Record<string, number[]> = {}

  // Initialize category data
  categories.forEach((cat) => {
    categoryData[cat.name] = []
  })

  if (period === "thisMonth" || period === "lastMonth") {
    // Weekly breakdown
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
    timeLabels.push(...weeks)

    weeks.forEach((week, weekIndex) => {
      categories.forEach((cat) => {
        const weekExpenses = expenses.filter((exp) => {
          const day = new Date(exp.date).getDate()
          const expWeekIndex = Math.floor((day - 1) / 7)
          return expWeekIndex === weekIndex && exp.category === cat.name
        })
        const total = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        categoryData[cat.name].push(total)
      })
    })
  } else {
    // Monthly breakdown
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    timeLabels.push(...months)

    months.forEach((month, monthIndex) => {
      categories.forEach((cat) => {
        const monthExpenses = expenses.filter((exp) => {
          const expMonth = new Date(exp.date).getMonth()
          return expMonth === monthIndex && exp.category === cat.name
        })
        const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        categoryData[cat.name].push(total)
      })
    })
  }

  const datasets = categories.map((cat) => ({
    label: cat.name,
    data: categoryData[cat.name],
    borderColor: cat.color,
    backgroundColor: cat.color,
    tension: 0.4,
  }))

  return {
    labels: timeLabels,
    datasets,
  }
}

// Calculate summary statistics
export function calculateSummary(expenses: Expense[], period: FilterPeriod) {
  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Calculate monthly average
  const uniqueMonths = new Set(
    expenses.map((exp) => {
      const date = new Date(exp.date)
      return `${date.getFullYear()}-${date.getMonth()}`
    }),
  )
  const monthlyAverage = uniqueMonths.size > 0 ? totalSpending / uniqueMonths.size : totalSpending

  // Calculate daily average
  const uniqueDays = new Set(expenses.map((exp) => new Date(exp.date).toDateString()))
  const dailyAverage = uniqueDays.size > 0 ? totalSpending / uniqueDays.size : totalSpending

  // Find top category
  const categoryTotals: Record<string, number> = {}
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })

  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  const topCategory = topCategoryEntry ? topCategoryEntry[0] : "N/A"
  const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0

  return {
    totalSpending,
    monthlyAverage,
    dailyAverage,
    topCategory,
    topCategoryAmount,
  }
}

// Get category breakdown with percentages
export function getCategoryBreakdown(expenses: Expense[], categories: Category[]) {
  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const categoryTotals: Record<string, number> = {}

  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })

  return Object.entries(categoryTotals).map(([name, value]) => {
    const cat = categories.find((c) => c.name === name)
    const percentage = totalSpending > 0 ? ((value / totalSpending) * 100).toFixed(1) : "0.0"

    return {
      label: name,
      value,
      color: cat?.color || "#6B7280",
      percentage: `${percentage}%`,
    }
  })
}
