"use client"

import { useState, useEffect } from "react"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  type TooltipItem,
} from "chart.js"
import { Pie, Bar, Line } from "react-chartjs-2"
import AnalyticsFilter, { type FilterPeriod } from "../../components/analyticsfilter"
import { useExpenses } from "../../hooks/use-expenses"
import { useCategories } from "../../hooks/use-categories"

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
)

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
    tension?: number
  }>
}

export default function AnalyticsPage() {
  const { expenses, isLoading } = useExpenses()
  const { categories } = useCategories()

  const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>("thisMonth")
  const [spendingByCategory, setSpendingByCategory] = useState<ChartData | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<ChartData | null>(null)
  const [dailyPattern, setDailyPattern] = useState<ChartData | null>(null)
  const [categoryTrends, setCategoryTrends] = useState<ChartData | null>(null)

  useEffect(() => {
    if (expenses.length === 0) return

    // Filter expenses based on selected period
    const now = new Date()
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)

      switch (selectedFilter) {
        case "thisMonth":
          return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
        case "lastMonth":
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          return (
            expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear()
          )
        case "thisYear":
          return expenseDate.getFullYear() === now.getFullYear()
        case "lastYear":
          return expenseDate.getFullYear() === now.getFullYear() - 1
        case "all":
        default:
          return true
      }
    })

    // Generate spending by category chart
    const categoryTotals = filteredExpenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const categoryNames = Object.keys(categoryTotals)
    const categoryValues = Object.values(categoryTotals)
    const categoryColors = categoryNames.map((catName) => {
      const cat = categories.find((c) => c.name === catName)
      return cat?.color || "#6B7280"
    })

    setSpendingByCategory({
      labels: categoryNames,
      datasets: [
        {
          label: "Expenses",
          data: categoryValues,
          backgroundColor: categoryColors,
          borderWidth: 0,
        },
      ],
    })

    // Generate monthly/weekly trend
    if (selectedFilter === "thisMonth" || selectedFilter === "lastMonth") {
      // Weekly trend for month view
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
      const weeklyData = weeks.map((_, weekIndex) => {
        return filteredExpenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            const dayOfMonth = expenseDate.getDate()
            return dayOfMonth > weekIndex * 7 && dayOfMonth <= (weekIndex + 1) * 7
          })
          .reduce((sum, expense) => sum + expense.amount, 0)
      })

      setMonthlyTrend({
        labels: weeks,
        datasets: [
          {
            label: "Weekly Spending",
            data: weeklyData,
            backgroundColor: "#6366F1",
            borderColor: "#6366F1",
            fill: true,
            tension: 0.4,
          },
        ],
      })
    } else {
      // Monthly trend for year view
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthlyData = months.map((_, monthIndex) => {
        return filteredExpenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            return expenseDate.getMonth() === monthIndex
          })
          .reduce((sum, expense) => sum + expense.amount, 0)
      })

      setMonthlyTrend({
        labels: months,
        datasets: [
          {
            label: "Monthly Spending",
            data: monthlyData,
            backgroundColor: "#6366F1",
            borderColor: "#6366F1",
            fill: true,
            tension: 0.4,
          },
        ],
      })
    }

    // Generate daily/monthly pattern
    if (selectedFilter === "thisYear" || selectedFilter === "lastYear") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthlyData = months.map((_, monthIndex) => {
        return filteredExpenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            return expenseDate.getMonth() === monthIndex
          })
          .reduce((sum, expense) => sum + expense.amount, 0)
      })

      setDailyPattern({
        labels: months,
        datasets: [
          {
            label: "Monthly Spending",
            data: monthlyData,
            backgroundColor: "#6366F1",
          },
        ],
      })
    } else {
      // Daily pattern for month view
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString())
      const dailyData = days.map((day) => {
        return filteredExpenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            return expenseDate.getDate() === Number.parseInt(day)
          })
          .reduce((sum, expense) => sum + expense.amount, 0)
      })

      setDailyPattern({
        labels: days,
        datasets: [
          {
            label: "Daily Spending",
            data: dailyData,
            backgroundColor: "#6366F1",
          },
        ],
      })
    }

    // Generate category trends
    const trendMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const categoryTrendData = categoryNames.slice(0, 3).map((catName, index) => {
      const cat = categories.find((c) => c.name === catName)
      const monthlyData = trendMonths.map((_, monthIndex) => {
        return filteredExpenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            return expense.category === catName && expenseDate.getMonth() === monthIndex
          })
          .reduce((sum, expense) => sum + expense.amount, 0)
      })

      return {
        label: catName,
        data: monthlyData,
        backgroundColor: cat?.color || "#6B7280",
        borderColor: cat?.color || "#6B7280",
        fill: false,
        tension: 0.4,
      }
    })

    setCategoryTrends({
      labels: trendMonths,
      datasets: categoryTrendData,
    })
  }, [expenses, categories, selectedFilter])

  const filteredExpenses = expenses.filter((expense) => {
    const now = new Date()
    const expenseDate = new Date(expense.date)

    switch (selectedFilter) {
      case "thisMonth":
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear()
      case "thisYear":
        return expenseDate.getFullYear() === now.getFullYear()
      case "lastYear":
        return expenseDate.getFullYear() === now.getFullYear() - 1
      case "all":
      default:
        return true
    }
  })

  const totalSpending = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const monthlyAverage = totalSpending / (selectedFilter === "thisYear" || selectedFilter === "lastYear" ? 12 : 1)
  const dailyAverage = totalSpending / (filteredExpenses.length || 1)

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

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => {
    const cat = categories.find((c) => c.name === name)
    const percentage = totalSpending > 0 ? ((value / totalSpending) * 100).toFixed(1) : "0.0"
    return {
      label: name,
      value,
      color: cat?.color || "#6B7280",
      percentage: `${percentage}%`,
    }
  })

  const pieOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) => `${context.label}: $${context.parsed}`,
        },
      },
    },
    maintainAspectRatio: false,
  }

  const areaOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
      },
    },
    maintainAspectRatio: false,
  }

  const barOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
      },
    },
    maintainAspectRatio: false,
  }

  const lineOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
      },
    },
    maintainAspectRatio: false,
  }

  return (
    <div className="p-6 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Insights</h1>
            <p className="text-gray-600">Deep dive into your spending patterns and trends</p>
          </div>
        </div>
        <AnalyticsFilter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Spending</div>
          <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            {selectedFilter === "all"
              ? "All time total"
              : selectedFilter === "thisYear" || selectedFilter === "lastYear"
                ? "Year total"
                : "Period total"}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Monthly Average</div>
          <div className="text-2xl font-bold">${monthlyAverage.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Per month</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Daily Average</div>
          <div className="text-2xl font-bold">${dailyAverage.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Per day</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Top Category</div>
          <div className="text-2xl font-bold">{topCategoryName}</div>
          <div className="text-xs text-gray-500">${topCategoryAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending by Category */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-1">Spending by Category</h3>
          <p className="text-sm text-gray-500 mb-6">Your spending breakdown by categories</p>

          <div className="h-64 mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
            ) : spendingByCategory ? (
              <Pie data={spendingByCategory} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
            )}
          </div>

          <div className="space-y-3">
            {categoryData.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${item.value.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">{item.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Spending Trend */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-1">
            {selectedFilter === "thisMonth" || selectedFilter === "lastMonth" ? "Weekly" : "Monthly"} Spending Trend
          </h3>
          <p className="text-sm text-gray-500 mb-6">Your spending trend over time</p>

          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
            ) : monthlyTrend ? (
              <Line data={monthlyTrend} options={areaOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Spending Pattern */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-1">
          {selectedFilter === "thisYear" || selectedFilter === "lastYear" ? "Monthly" : "Daily"} Spending Pattern -{" "}
          {selectedFilter === "thisMonth"
            ? "This Month"
            : selectedFilter === "lastMonth"
              ? "Last Month"
              : selectedFilter === "thisYear"
                ? "This Year"
                : selectedFilter === "lastYear"
                  ? "Last Year"
                  : "All Time"}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Your {selectedFilter === "thisYear" || selectedFilter === "lastYear" ? "monthly" : "daily"} spending
          throughout the period
        </p>

        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
          ) : dailyPattern ? (
            <Bar data={dailyPattern} options={barOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Category Spending Trends */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-1">Category Spending Trends</h3>
        <p className="text-sm text-gray-500 mb-6">How your spending by category changed over time</p>

        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
          ) : categoryTrends ? (
            <Line data={categoryTrends} options={lineOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Insights Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-sm font-medium text-gray-600">Highest Spending Day</div>
          <div className="text-lg font-bold">
            {selectedFilter === "thisMonth" ? "This Month" : selectedFilter === "thisYear" ? "This Year" : "Best Day"}
          </div>
          <div className="text-xs text-gray-500">${(dailyAverage * 2.4).toFixed(2)} spent</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">📉</div>
          <div className="text-sm font-medium text-gray-600">Lowest Spending Category</div>
          <div className="text-lg font-bold">
            {categoryData.length > 0
              ? categoryData.reduce((min, item) => (item.value < min.value ? item : min)).label
              : "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            $
            {categoryData.length > 0
              ? categoryData.reduce((min, item) => (item.value < min.value ? item : min)).value.toFixed(2)
              : "0.00"}{" "}
            total
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-sm font-medium text-gray-600">Spending Frequency</div>
          <div className="text-lg font-bold">
            {filteredExpenses.length > 0 ? (filteredExpenses.length / 30).toFixed(1) : "0.0"} times/day
          </div>
          <div className="text-xs text-gray-500">Average transactions</div>
        </div>
      </div>
    </div>
  )
}
