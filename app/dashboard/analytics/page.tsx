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
import {
  getAnalyticsData,
  generateSpendingByCategory,
  generateMonthlyTrend,
  generateDailyPattern,
  generateCategoryTrends,
  type ChartData,
} from "../../../data/analyticsData"

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

export default function AnalyticsPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>("thisMonth")
  const [spendingByCategory, setSpendingByCategory] = useState<ChartData | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<ChartData | null>(null)
  const [dailyPattern, setDailyPattern] = useState<ChartData | null>(null)
  const [categoryTrends, setCategoryTrends] = useState<ChartData | null>(null)

  useEffect(() => {
    // Generate data based on selected filter
    setSpendingByCategory(generateSpendingByCategory(selectedFilter))
    setMonthlyTrend(generateMonthlyTrend(selectedFilter))
    setDailyPattern(generateDailyPattern(selectedFilter))
    setCategoryTrends(generateCategoryTrends(selectedFilter))
  }, [selectedFilter])

  const currentData = getAnalyticsData(selectedFilter)

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
          <div className="text-2xl font-bold">${currentData.summary.totalSpending.toFixed(2)}</div>
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
          <div className="text-2xl font-bold">${currentData.summary.monthlyAverage.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Per month</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Daily Average</div>
          <div className="text-2xl font-bold">${currentData.summary.dailyAverage.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Per day</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Top Category</div>
          <div className="text-2xl font-bold">{currentData.summary.topCategory}</div>
          <div className="text-xs text-gray-500">${currentData.summary.topCategoryAmount.toFixed(2)}</div>
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
            {currentData.categoryData.map((item) => (
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
          <div className="text-lg font-bold">
            {selectedFilter === "thisMonth" ? "January 15th" : selectedFilter === "thisYear" ? "May 2024" : "Best Day"}
          </div>
          <div className="text-xs text-gray-500">${(currentData.summary.dailyAverage * 2.4).toFixed(2)} spent</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">📉</div>
          <div className="text-sm font-medium text-gray-600">Lowest Spending Category</div>
          <div className="text-lg font-bold">
            {currentData.categoryData.reduce((min, item) => (item.value < min.value ? item : min)).label}
          </div>
          <div className="text-xs text-gray-500">
            ${currentData.categoryData.reduce((min, item) => (item.value < min.value ? item : min)).value.toFixed(2)}{" "}
            total
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-sm font-medium text-gray-600">Spending Frequency</div>
          <div className="text-lg font-bold">
            {(currentData.summary.totalSpending / currentData.summary.dailyAverage / 30).toFixed(1)} times/day
          </div>
          <div className="text-xs text-gray-500">Average transactions</div>
        </div>
      </div>
    </div>
  )
}
