"use client"

import { useState, useEffect, useMemo } from "react" 
import { useExpenses } from "../hooks/use-expenses"
import { useCategories } from "../hooks/use-categories"
import { 
  pieOptions, 
  barOptions, 
  chartColors 
} from "../../data/chartConfig"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js"
import { Pie, Bar } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement)

interface ChartDataset {
  label: string
  data: number[]
  backgroundColor: string | string[]
  borderWidth?: number
  borderColor?: string
  cutout?: string
  barPercentage?: number
  categoryPercentage?: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

interface User {
  firstName?: string
  lastName?: string
  email?: string
  profileImage?: string
}

interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  emoji: string
  date: string
}

export default function DashboardPage() {
  const { expenses, isLoading: expensesLoading } = useExpenses()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const [user, setUser] = useState<User>({})
  // Wrap this logic in useMemo to prevent infinite loops
  const activeExpenses = useMemo(() => {
    const validCategoryNames = categories.map((c) => c.name)
    return expenses.filter((expense) => 
      validCategoryNames.includes(expense.category)
    )
  }, [expenses, categories])

  const isLoading = expensesLoading || categoriesLoading
 
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setUser(JSON.parse(savedProfile))
    }

    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        setUser((prev) => ({
          ...prev,
          firstName: customEvent.detail.firstName || "",
          lastName: customEvent.detail.lastName || "",
          email: customEvent.detail.email || "",
          profileImage: customEvent.detail.profileImage || "",
        }))
      }
    }

    window.addEventListener("profileUpdated", handleProfileUpdate)
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate)
    }
  }, [])

  const [expensesData, setExpensesData] = useState<ChartData | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<ChartData | null>(null)
  const totalExpenses = useMemo(() => 
    activeExpenses.reduce((sum, exp) => sum + exp.amount, 0), 
  [activeExpenses])

  useEffect(() => {
    if (activeExpenses.length === 0) {
      setExpensesData(null)
      setMonthlyTrend(null)
      return
    }

    const categoryTotals = activeExpenses.reduce(
      (acc, expense: Expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const categoryNames = Object.keys(categoryTotals)
    const values = Object.values(categoryTotals)

    setExpensesData({
      labels: categoryNames,
      datasets: [
        {
          label: "Expenses",
          data: values,
          backgroundColor: chartColors, 
          borderWidth: 0,
          cutout: "60%",
        },
      ],
    })

    const monthlySpending: Record<string, number> = {}
    const sortedExpenses = [...activeExpenses].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedExpenses.forEach((exp) => {
      const monthYear = new Date(exp.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      monthlySpending[monthYear] = (monthlySpending[monthYear] || 0) + exp.amount
    })

    const uniqueMonths = Array.from(new Set(Object.keys(monthlySpending)))
    const trendLabels = uniqueMonths.slice(-4) 
    const trendValues = trendLabels.map((monthYear) => monthlySpending[monthYear] || 0)

    setMonthlyTrend({
      labels: trendLabels,
      datasets: [
        {
          label: "Monthly Spending",
          data: trendValues,
          backgroundColor: chartColors[3],
          borderColor: chartColors[3],
          borderWidth: 1,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
      ],
    })
  }, [activeExpenses, totalExpenses])

  const legendData = expensesData
    ? expensesData.labels.map((label, index) => ({
        label,
        value: expensesData.datasets[0].data[index],
        color: Array.isArray(expensesData.datasets[0].backgroundColor)
          ? expensesData.datasets[0].backgroundColor[index % expensesData.datasets[0].backgroundColor.length]
          : expensesData.datasets[0].backgroundColor,
      }))
    : []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        Welcome {user.firstName ? `${user.firstName} ${user.lastName}` : "User"}!
      </h1>
      <p className="text-gray-600 mb-6">{user.email ? `Logged in as ${user.email}` : "No email found"}</p>

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Expenses by Category</h2>
          <p className="text-sm text-gray-500 mb-6">Your spending breakdown for this month</p>

          <div className="h-64 mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
            ) : expensesData && expensesData.labels.length > 0 ? (
              <Pie data={expensesData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-center px-4">
                No active expenses found.<br/>Add expenses to categories to see data.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {legendData.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                 
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-medium">${item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Monthly Trend</h2>
          <p className="text-sm text-gray-500 mb-6">Your spending trend over the last few months</p>
          <div className="h-64 mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
            ) : monthlyTrend && monthlyTrend.labels.length > 0 ? (
              <Bar data={monthlyTrend} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-center px-4">
                No active expenses found.<br/>Add expenses to see trends.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Expenses List */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
        <p className="text-sm text-gray-500 mb-4">Your latest spending activity (Active Categories Only)</p>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading expenses...</div>
          ) : activeExpenses.length === 0 ? (
            <div className="text-center text-gray-500">No active expenses yet. Add your first expense!</div>
          ) : (
            activeExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((expense: Expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{expense.emoji}</span>
                    <div>
                      <p className="text-xs text-gray-500">
                       {new Date(expense.date).toLocaleDateString()} • {expense.category}
                      </p>
                      <p className="font-medium">{expense.description}</p>
                    </div>
                  </div>
                  <p className="font-semibold">${expense.amount.toFixed(2)}</p>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}