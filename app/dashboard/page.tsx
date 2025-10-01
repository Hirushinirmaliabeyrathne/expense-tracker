
"use client"

import { useState, useEffect } from "react"
import Card from "../components/Card"
import AddExpenseModal, { type ExpenseData } from "../components/addexpensemodal"
import { useExpenses } from "../hooks/use-expenses"
import { useCategories } from "../hooks/use-categories"
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
  type TooltipItem,
} from "chart.js"
import { Pie, Bar } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement)

// Define interfaces for chart data
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

// User interface
interface User {
  firstName?: string
  lastName?: string
  email?: string
  profileImage?: string
}

// Define Expense interface
interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  emoji: string
  date: string
}

export default function DashboardPage() {
  const { expenses, isLoading: expensesLoading, addExpense } = useExpenses()
  const { categories, addCategory } = useCategories() // Get addCategory from useCategories

  // 👤 User state
  const [user, setUser] = useState<User>({})

  // 📌 Load user from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setUser(JSON.parse(savedProfile))
    }

    // Listen for profile updates from DashboardLayout
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

  // Existing states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expensesData, setExpensesData] = useState<ChartData | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<ChartData | null>(null)

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const cards = [
    { title: "Users", value: "1,230", desc: "Total registered users" },
    { title: "Revenue", value: "$8,540", desc: "Monthly revenue" },
    {
      title: "Expenses",
      value: `$${totalExpenses.toFixed(2)}`,
      desc: "Monthly expenses",
    },
    { title: "Growth", value: "12%", desc: "Compared to last month" }, // This would ideally be dynamic
  ]

  const handleAddExpense = async (expenseData: ExpenseData) => {
    await addExpense(expenseData)
    setIsModalOpen(false)
  }

  // --- FIX START ---
  // Create a wrapper function for addCategory to match the expected type in AddExpenseModal
  const handleAddCategoryFromModal = async (categoryName: string) => {
    // Assuming a default emoji and color for new categories added from the modal
    const newCategory = {
      name: categoryName,
      emoji: "🆕", // Or a random one, or a user-chosen default
      color: "#9CA3AF", // Default gray color
    }
    await addCategory(newCategory)
  }
  // --- FIX END ---

  useEffect(() => {
    if (expenses.length === 0) {
      setExpensesData(null); // Clear chart data if no expenses
      setMonthlyTrend(null); // Clear monthly trend if no expenses
      return;
    }

    const categoryTotals = expenses.reduce(
      (acc, expense: Expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const categoryNames = Object.keys(categoryTotals)
    const values = Object.values(categoryTotals)

    const colors = categoryNames.map((catName) => {
      const cat = categories.find((c) => c.name === catName)
      return cat?.color || "#6B7280" // Default color if category not found
    })

    setExpensesData({
      labels: categoryNames,
      datasets: [
        {
          label: "Expenses",
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          cutout: "60%",
        },
      ],
    })

    // Monthly trend - more dynamic (example for 4 months)
    const monthlySpending: Record<string, number> = {};
    expenses.forEach(exp => {
      const monthYear = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlySpending[monthYear] = (monthlySpending[monthYear] || 0) + exp.amount;
    });

    // Get the last 4 unique month-year strings
    const sortedMonthYears = Array.from(new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-4); // Get the last 4 months

    // Fill in data for the last 4 months, using 0 if no expenses for that month
    const trendLabels = sortedMonthYears;
    const trendValues = sortedMonthYears.map(monthYear => monthlySpending[monthYear] || 0);

    setMonthlyTrend({
      labels: trendLabels,
      datasets: [
        {
          label: "Monthly Spending",
          data: trendValues,
          backgroundColor: "#6366F1",
          borderColor: "#6366F1",
          borderWidth: 1,
          barPercentage: 0.7, // Adjust bar width
          categoryPercentage: 0.8, // Adjust spacing between bars
        },
      ],
    });

  }, [expenses, categories, totalExpenses])

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) => `${context.label}: $${context.parsed.toFixed(2)}`,
        },
      },
      title: {
        display: false, // Title already handled by h2
      }
    },
    maintainAspectRatio: false,
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`,
        },
      },
      title: {
        display: false, // Title already handled by h2
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false, // Remove vertical grid lines
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)', // Light horizontal grid lines
        },
        ticks: {
          callback: function(value: string | number) {
            return `$${value}`;
          }
        }
      },
    },
    maintainAspectRatio: false,
  }

  const legendData = expensesData
    ? expensesData.labels.map((label, index) => ({
        label,
        value: expensesData.datasets[0].data[index],
        color: Array.isArray(expensesData.datasets[0].backgroundColor)
          ? expensesData.datasets[0].backgroundColor[index]
          : expensesData.datasets[0].backgroundColor,
      }))
    : []

  return (
    <div className="p-6">
      {/* 👤 User Welcome Section */}
      <h1 className="text-2xl font-bold mb-2">
        Welcome, {user.firstName ? `${user.firstName} ${user.lastName}` : "User"}
      </h1>
      <p className="text-gray-600 mb-6">{user.email ? `Logged in as ${user.email}` : "No email found"}</p>

      {/* Add Expense Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-[#001571] text-white rounded-lg flex items-center gap-2 hover:bg-[#001571]/90 transition"
      >
        <AddCircleOutlineRoundedIcon />
        Add Expense
      </button>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
        {cards.map((card) => (
          <Card key={card.title} title={card.title} value={card.value} desc={card.desc} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Expenses by Category</h2>
          <p className="text-sm text-gray-500 mb-6">Your spending breakdown for this month</p>

          <div className="h-64 mb-6">
            {expensesLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
            ) : expensesData && expensesData.labels.length > 0 ? (
              <Pie data={expensesData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No category expenses data available. Add some expenses!</div>
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

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Monthly Trend</h2>
          <p className="text-sm text-gray-500 mb-6">Your spending trend over the last few months</p>
          <div className="h-64 mb-6">
            {expensesLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
            ) : monthlyTrend && monthlyTrend.labels.length > 0 ? (
              <Bar data={monthlyTrend} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No monthly trend data available. Add some expenses!</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Expenses Section */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
        <p className="text-sm text-gray-500 mb-4">Your latest spending activity</p>

        <div className="space-y-4">
          {expensesLoading ? (
            <div className="text-center text-gray-500">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center text-gray-500">No expenses yet. Add your first expense!</div>
          ) : (
            expenses.slice(0, 5).map((expense: Expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{expense.emoji}</span>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-gray-500">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">${expense.amount.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddExpense={handleAddExpense}
        categories={categories} // Pass categories to the modal
        onAddCategory={handleAddCategoryFromModal} // Pass the wrapped function here
      />
    </div>
  )
}