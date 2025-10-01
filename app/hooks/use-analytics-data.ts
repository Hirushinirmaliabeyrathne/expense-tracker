// hooks/use-analytics-data.ts
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
} from "chart.js"
import { useExpenses } from "./use-expenses"
import { useCategories } from "./use-categories"
import { FilterPeriod, CategorySummary } from "../types" 
import { calculateSummaryStats } from "../../data/analyticsCalculations"
import { months, weeks, daysInMonth } from "../../data/constants"

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

// Interface for Chart.js data structure
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

interface AnalyticsResult {
  isLoading: boolean
  totalSpending: number
  monthlyAverage: number
  dailyAverage: number
  topCategoryName: string
  topCategoryAmount: number
  spendingByCategory: ChartData | null
  monthlyTrend: ChartData | null
  dailyPattern: ChartData | null
  categoryTrends: ChartData | null
  categoryData: CategorySummary[]
}


export function useAnalyticsData(selectedFilter: FilterPeriod): AnalyticsResult {
  const { expenses, isLoading: isLoadingExpenses } = useExpenses()
  const { categories, isLoading: isLoadingCategories } = useCategories()

  // State for chart data
  const [spendingByCategory, setSpendingByCategory] = useState<ChartData | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<ChartData | null>(null)
  const [dailyPattern, setDailyPattern] = useState<ChartData | null>(null)
  const [categoryTrends, setCategoryTrends] = useState<ChartData | null>(null)

  // State for summary statistics
  const [totalSpending, setTotalSpending] = useState(0)
  const [monthlyAverage, setMonthlyAverage] = useState(0)
  const [dailyAverage, setDailyAverage] = useState(0)
  const [topCategoryName, setTopCategoryName] = useState("N/A")
  const [topCategoryAmount, setTopCategoryAmount] = useState(0)
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]) 


  const isLoading = isLoadingExpenses || isLoadingCategories

  
  useEffect(() => {
   
    if (isLoading || expenses.length === 0 || categories.length === 0) {
      setSpendingByCategory(null)
      setMonthlyTrend(null)
      setDailyPattern(null)
      setCategoryTrends(null)
      setTotalSpending(0)
      setMonthlyAverage(0)
      setDailyAverage(0)
      setTopCategoryName("N/A")
      setTopCategoryAmount(0)
      setCategoryData([])
      return
    }

    const now = new Date() 

    // 1. Filter expenses based on the selected period
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

    // 2. Calculate summary statistics using the dedicated utility function
    const summaryStats = calculateSummaryStats(filteredExpenses, categories, selectedFilter)
    setTotalSpending(summaryStats.totalSpending)
    setMonthlyAverage(summaryStats.monthlyAverage)
    setDailyAverage(summaryStats.dailyAverage)
    setTopCategoryName(summaryStats.topCategoryName)
    setTopCategoryAmount(summaryStats.topCategoryAmount)
    setCategoryData(summaryStats.categoryData)

    // 3. Generate data for "Spending by Category" chart (Pie Chart)
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

    // 4. Generate data for "Monthly/Weekly Spending Trend" (Line Chart)
    if (selectedFilter === "thisMonth" || selectedFilter === "lastMonth") {
      // For month views, show weekly trend
      const weeklyData = weeks.map((_, weekIndex) => {
        return filteredExpenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            const dayOfMonth = expenseDate.getDate()
            // Days for week 1: 1-7, week 2: 8-14, etc.
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
      const monthlyData = months.map((_, monthIndex) => {
        return filteredExpenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            const yearMatch = selectedFilter === "thisYear" ? expenseDate.getFullYear() === now.getFullYear() :
                             selectedFilter === "lastYear" ? expenseDate.getFullYear() === now.getFullYear() - 1 : true;
            return expenseDate.getMonth() === monthIndex && yearMatch
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

    // 5. Generate data for "Daily/Monthly Spending Pattern" (Bar Chart)
    if (selectedFilter === "thisYear" || selectedFilter === "lastYear") {
     
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
      
      let currentMonthDays = 0;
      if (selectedFilter === "thisMonth") {
        currentMonthDays = daysInMonth(now.getFullYear(), now.getMonth());
      } else if (selectedFilter === "lastMonth") {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        currentMonthDays = daysInMonth(lastMonthDate.getFullYear(), lastMonthDate.getMonth());
      } else { 
        currentMonthDays = 30; 
      }

      const days = Array.from({ length: currentMonthDays }, (_, i) => (i + 1).toString())
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

    // 6. Generate data for "Category Spending Trends" (Line Chart)
    
    const trendMonthsLabels = months.slice(0, 6);
    const currentYear = now.getFullYear();

    const categoryTrendData = categoryNames.slice(0, 3).map((catName) => { 
      const cat = categories.find((c) => c.name === catName)
      const monthlyData = trendMonthsLabels.map((_, monthIndex) => {
        
        return filteredExpenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
           
            const yearCheck = selectedFilter === "thisYear" ? expenseDate.getFullYear() === currentYear :
                              selectedFilter === "lastYear" ? expenseDate.getFullYear() === currentYear - 1 :
                              expenseDate.getFullYear() === currentYear; 
            return expense.category === catName && expenseDate.getMonth() === monthIndex && yearCheck
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
      labels: trendMonthsLabels,
      datasets: categoryTrendData,
    })

  }, [expenses, categories, selectedFilter, isLoading]) 

  return {
    isLoading,
    totalSpending,
    monthlyAverage,
    dailyAverage,
    topCategoryName,
    topCategoryAmount,
    spendingByCategory,
    monthlyTrend,
    dailyPattern,
    categoryTrends,
    categoryData,
  }
}