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

interface ChartDataset {
  label?: string
  data: number[]
  backgroundColor: string | string[]
  borderColor?: string
  borderWidth?: number
  cutout?: string
  fill?: boolean
  tension?: number
  borderRadius?: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export default function AnalyticsPage() {
  const [spendingByCategory, setSpendingByCategory] = useState<ChartData | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<ChartData | null>(null)
  const [dailyPattern, setDailyPattern] = useState<ChartData | null>(null)
  const [categoryTrends, setCategoryTrends] = useState<ChartData | null>(null)

  useEffect(() => {
    // Spending by Category (Donut Chart)
    setSpendingByCategory({
      labels: ["Food", "Transportation", "Entertainment", "Shopping", "Utilities"],
      datasets: [
        {
          data: [245.5, 320.0, 125.99, 489.99, 180.0],
          backgroundColor: ["#9CA3AF", "#6B7280", "#4B5563", "#374151", "#1F2937"],
          borderWidth: 0,
          cutout: "60%",
        },
      ],
    })

    // Monthly Spending Trend (Area Chart)
    setMonthlyTrend({
      labels: ["2021", "2022", "2023", "Dec 2024"],
      datasets: [
        {
          label: "Monthly Spending",
          data: [400, 350, 300, 280],
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderColor: "#6366F1",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    })

    // Daily Spending Pattern (Bar Chart)
    const dailyData = Array.from({ length: 31 }, () => Math.floor(Math.random() * 100) + 20)
    setDailyPattern({
      labels: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
      datasets: [
        {
          label: "Daily Spending",
          data: dailyData,
          backgroundColor: "#6366F1",
          borderRadius: 4,
        },
      ],
    })

    // Category Spending Trends (Multi-line Chart)
    setCategoryTrends({
      labels: ["Jan 2024", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec 2024"],
      datasets: [
        {
          label: "Food",
          data: [180, 170, 160, 150, 140, 130, 120, 110, 100, 90, 80, 70],
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
        },
        {
          label: "Transportation",
          data: [150, 145, 140, 135, 130, 125, 120, 115, 110, 105, 100, 95],
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
        },
        {
          label: "Entertainment",
          data: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45],
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
        },
        {
          label: "Shopping",
          data: [120, 115, 110, 105, 100, 95, 90, 85, 80, 75, 70, 65],
          borderColor: "#8B5CF6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
        },
      ],
    })
  }, [])

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

  const categoryLegendData = [
    { label: "Food", value: 245.5, color: "#9CA3AF", percentage: "16.9%" },
    { label: "Transportation", value: 320.0, color: "#6B7280", percentage: "22.0%" },
    { label: "Entertainment", value: 125.99, color: "#4B5563", percentage: "8.7%" },
    { label: "Shopping", value: 489.99, color: "#374151", percentage: "33.6%" },
    { label: "Utilities", value: 180.0, color: "#1F2937", percentage: "12.4%" },
  ]

  return (
    <div className="p-6 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Insights</h1>
            <p className="text-gray-600">Comprehensive view of your spending patterns</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Spending</div>
          <div className="text-2xl font-bold">$858.72</div>
          <div className="text-xs text-gray-500">All time total</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Monthly Average</div>
          <div className="text-2xl font-bold">$429.36</div>
          <div className="text-xs text-gray-500">Per month</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Daily Average</div>
          <div className="text-2xl font-bold">$53.12</div>
          <div className="text-xs text-gray-500">Per day</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Top Category</div>
          <div className="text-2xl font-bold">Transportation</div>
          <div className="text-xs text-gray-500">Highest spending</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending by Category */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-1">Spending by Category</h3>
          <p className="text-sm text-gray-500 mb-6">Your spending breakdown by categories</p>

          <div className="h-64 mb-6">
            {spendingByCategory ? (
              <Pie data={spendingByCategory} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
            )}
          </div>

          <div className="space-y-3">
            {categoryLegendData.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${item.value}</span>
                  <span className="text-xs text-gray-500">{item.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Spending Trend */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-1">Monthly Spending Trend</h3>
          <p className="text-sm text-gray-500 mb-6">Your spending trend over time</p>

          <div className="h-64">
            {monthlyTrend ? (
              <Line data={monthlyTrend} options={areaOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Spending Pattern */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-1">Daily Spending Pattern - January 2024</h3>
        <p className="text-sm text-gray-500 mb-6">Your daily spending throughout the month</p>

        <div className="h-80">
          {dailyPattern ? (
            <Bar data={dailyPattern} options={barOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
          )}
        </div>
      </div>

      {/* Category Spending Trends */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-1">Category Spending Trends</h3>
        <p className="text-sm text-gray-500 mb-6">How your spending by category changed over time</p>

        <div className="h-80">
          {categoryTrends ? (
            <Line data={categoryTrends} options={lineOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
          )}
        </div>
      </div>

      {/* Insights Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-sm font-medium text-gray-600">Highest Spending Day</div>
          <div className="text-lg font-bold">January 15th</div>
          <div className="text-xs text-gray-500">$127.50 spent</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">📉</div>
          <div className="text-sm font-medium text-gray-600">Lowest Spending Category</div>
          <div className="text-lg font-bold">Entertainment</div>
          <div className="text-xs text-gray-500">$125.99 total</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-sm font-medium text-gray-600">Spending Frequency</div>
          <div className="text-lg font-bold">2.3 times/day</div>
          <div className="text-xs text-gray-500">Average transactions</div>
        </div>
      </div>
    </div>
  )
}
