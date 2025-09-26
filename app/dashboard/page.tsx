"use client"

import { useState, useEffect } from "react"
import Card from "../components/Card"
import AddExpenseModal, { type ExpenseData } from "../components/addexpensemodal"
import { defaultExpenses, type Expense, generateExpenseId, categoryColors } from "../../data/expenseData"
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
  cutout?: string
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses)

  const cards = [
    { title: "Users", value: "1,230", desc: "Total registered users" },
    { title: "Revenue", value: "$8,540", desc: "Monthly revenue" },
    {
      title: "Expenses",
      value: `$${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}`,
      desc: "Monthly expenses",
    },
    { title: "Growth", value: "12%", desc: "Compared to last month" },
  ]

  const [expensesData, setExpensesData] = useState<ChartData | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<ChartData | null>(null)

  const handleAddExpense = (expenseData: ExpenseData) => {
    const newExpense: Expense = {
      id: generateExpenseId(),
      ...expenseData,
      createdAt: new Date(),
    }
    setExpenses((prev) => [newExpense, ...prev])
  }

  useEffect(() => {
    const categoryTotals = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const categories = Object.keys(categoryTotals)
    const values = Object.values(categoryTotals)
    const colors = categories.map((cat) => categoryColors[cat] || "#6B7280")

    setExpensesData({
      labels: categories,
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

    // Monthly trend (keeping original logic for now)
    const monthly = {
      labels: ["Dec", "Jan", "Feb", "Mar"],
      values: [280, 300, 250, 320],
    }

    setMonthlyTrend({
      labels: monthly.labels,
      datasets: [
        {
          label: "Monthly Spending",
          data: monthly.values,
          backgroundColor: "#6366F1",
        },
      ],
    })
  }, [expenses])

  const pieOptions = {
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) => `${context.label}: $${context.parsed}`,
        },
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
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-[#001571] text-white rounded-lg flex items-center gap-2 justify-end hover:bg-[#001571]/90 transition"
      >
        <AddCircleOutlineRoundedIcon />
        Add Expense
      </button>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            {expensesData ? <Pie data={expensesData} options={pieOptions} /> : <p>Loading chart...</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {legendData.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-medium">${item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Monthly Trend</h2>
          {monthlyTrend ? <Bar data={monthlyTrend} /> : <p>Loading chart...</p>}
        </div>
      </div>

      {/* Recent Expenses Section */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
        <p className="text-sm text-gray-500 mb-4">Your latest spending activity</p>

        <div className="space-y-4">
          {expenses.slice(0, 5).map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{expense.emoji}</span>
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-xs text-gray-500">
                    {expense.category} • {expense.date}
                  </p>
                </div>
              </div>
              <p className="font-semibold">${expense.amount}</p>
            </div>
          ))}
        </div>
      </div>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddExpense={handleAddExpense} />
    </div>
  )
}
