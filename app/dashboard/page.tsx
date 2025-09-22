"use client"

import { useState, useEffect } from "react"
import Card from "../components/Card"
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
  const cards = [
    { title: "Users", value: "1,230", desc: "Total registered users" },
    { title: "Revenue", value: "$8,540", desc: "Monthly revenue" },
    { title: "Expenses", value: "$3,200", desc: "Monthly expenses" },
    { title: "Growth", value: "12%", desc: "Compared to last month" },
  ]

  // Example dynamic data (could be fetched from API later)
  const [expensesData, setExpensesData] = useState<ChartData | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<ChartData | null>(null)

  useEffect(() => {
    // Simulate fetch data
    const expenses = {
      labels: ["Food", "Transportation", "Entertainment", "Shopping"],
      values: [61, 120, 25.99, 89.99],
    }

    const monthly = {
      labels: ["Dec", "Jan", "Feb", "Mar"],
      values: [280, 300, 250, 320],
    }

    setExpensesData({
      labels: expenses.labels,
      datasets: [
        {
          label: "Expenses",
          data: expenses.values,
          backgroundColor: ["#9CA3AF", "#6B7280", "#4B5563", "#374151"], // grayscale colors
          borderWidth: 0,
          cutout: "60%", // Creates donut effect
        },
      ],
    })

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
  }, [])

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

  const legendData = [
    { label: "Food", value: 61, color: "#6366F1" },
    { label: "Transportation", value: 120, color: "#10B981" },
    { label: "Entertainment", value: 25.99, color: "#F59E0B" },
    { label: "Shopping", value: 89.99, color: "#EF4444" },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

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
          {/* Expense Item */}
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              <div>
                <p className="font-medium">Lunch at restaurant</p>
                <p className="text-xs text-gray-500">Food • 2024-01-15</p>
              </div>
            </div>
            <p className="font-semibold">$45.5</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⛽</span>
              <div>
                <p className="font-medium">Gas for car</p>
                <p className="text-xs text-gray-500">Transportation • 2024-01-14</p>
              </div>
            </div>
            <p className="font-semibold">$120</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div>
                <p className="font-medium">Movie tickets</p>
                <p className="text-xs text-gray-500">Entertainment • 2024-01-13</p>
              </div>
            </div>
            <p className="font-semibold">$25.99</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛍️</span>
              <div>
                <p className="font-medium">Clothes</p>
                <p className="text-xs text-gray-500">Shopping • 2024-01-12</p>
              </div>
            </div>
            <p className="font-semibold">$89.99</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <span className="text-2xl">☕</span>
              <div>
                <p className="font-medium">Coffee</p>
                <p className="text-xs text-gray-500">Food • 2024-01-11</p>
              </div>
            </div>
            <p className="font-semibold">$15.5</p>
          </div>
        </div>
      </div>
    </div>
  )
}
