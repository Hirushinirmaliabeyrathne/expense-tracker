import type { FilterPeriod } from "../app/components/analyticsfilter"
export interface ChartDataset {
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

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface SummaryStats {
  totalSpending: number
  monthlyAverage: number
  dailyAverage: number
  topCategory: string
  topCategoryAmount: number
}

export interface CategoryLegendItem {
  label: string
  value: number
  color: string
  percentage: string
}

// Mock data for different time periods
const mockData = {
  thisMonth: {
    summary: {
      totalSpending: 858.72,
      monthlyAverage: 429.36,
      dailyAverage: 53.12,
      topCategory: "Transportation",
      topCategoryAmount: 272.75,
    },
    categoryData: [
      { label: "Food", value: 245.5, color: "#6366F1", percentage: "28.6%" },
      { label: "Transportation", value: 272.75, color: "#10B981", percentage: "31.8%" },
      { label: "Entertainment", value: 125.99, color: "#F59E0B", percentage: "14.7%" },
      { label: "Shopping", value: 134.48, color: "#EF4444", percentage: "15.7%" },
      { label: "Utilities", value: 80.0, color: "#06B6D4", percentage: "9.3%" },
    ],
    monthlyTrend: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      data: [180, 220, 195, 263.72],
    },
    dailyPattern: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100) + 20),
  },
  lastMonth: {
    summary: {
      totalSpending: 1245.89,
      monthlyAverage: 622.95,
      dailyAverage: 40.19,
      topCategory: "Shopping",
      topCategoryAmount: 489.99,
    },
    categoryData: [
      { label: "Food", value: 345.5, color: "#6366F1", percentage: "27.7%" },
      { label: "Transportation", value: 220.0, color: "#10B981", percentage: "17.7%" },
      { label: "Entertainment", value: 190.4, color: "#F59E0B", percentage: "15.3%" },
      { label: "Shopping", value: 489.99, color: "#EF4444", percentage: "39.3%" },
      { label: "Utilities", value: 0, color: "#06B6D4", percentage: "0%" },
    ],
    monthlyTrend: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      data: [280, 320, 345, 300.89],
    },
    dailyPattern: Array.from({ length: 30 }, () => Math.floor(Math.random() * 120) + 15),
  },
  thisYear: {
    summary: {
      totalSpending: 12458.9,
      monthlyAverage: 1037.41,
      dailyAverage: 34.13,
      topCategory: "Food",
      topCategoryAmount: 4245.5,
    },
    categoryData: [
      { label: "Food", value: 4245.5, color: "#6366F1", percentage: "34.1%" },
      { label: "Transportation", value: 3200.0, color: "#10B981", percentage: "25.7%" },
      { label: "Entertainment", value: 1825.99, color: "#F59E0B", percentage: "14.7%" },
      { label: "Shopping", value: 2489.99, color: "#EF4444", percentage: "20.0%" },
      { label: "Utilities", value: 697.42, color: "#06B6D4", percentage: "5.6%" },
    ],
    monthlyTrend: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [980, 1120, 1050, 890, 1200, 1150, 980, 1080, 1020, 1100, 950, 858.72],
    },
    dailyPattern: Array.from({ length: 365 }, () => Math.floor(Math.random() * 150) + 10),
  },
  lastYear: {
    summary: {
      totalSpending: 11234.56,
      monthlyAverage: 936.21,
      dailyAverage: 30.78,
      topCategory: "Transportation",
      topCategoryAmount: 3890.45,
    },
    categoryData: [
      { label: "Food", value: 3456.78, color: "#6366F1", percentage: "30.8%" },
      { label: "Transportation", value: 3890.45, color: "#10B981", percentage: "34.6%" },
      { label: "Entertainment", value: 1567.89, color: "#F59E0B", percentage: "14.0%" },
      { label: "Shopping", value: 1789.44, color: "#EF4444", percentage: "15.9%" },
      { label: "Utilities", value: 530.0, color: "#06B6D4", percentage: "4.7%" },
    ],
    monthlyTrend: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [850, 920, 980, 1050, 1120, 1080, 950, 890, 940, 1020, 1100, 1234.56],
    },
    dailyPattern: Array.from({ length: 365 }, () => Math.floor(Math.random() * 140) + 8),
  },
  all: {
    summary: {
      totalSpending: 45678.9,
      monthlyAverage: 1269.97,
      dailyAverage: 41.67,
      topCategory: "Food",
      topCategoryAmount: 15678.9,
    },
    categoryData: [
      { label: "Food", value: 15678.9, color: "#6366F1", percentage: "34.3%" },
      { label: "Transportation", value: 12890.45, color: "#10B981", percentage: "28.2%" },
      { label: "Entertainment", value: 6789.12, color: "#F59E0B", percentage: "14.9%" },
      { label: "Shopping", value: 7890.43, color: "#EF4444", percentage: "17.3%" },
      { label: "Utilities", value: 2430.0, color: "#06B6D4", percentage: "5.3%" },
    ],
    monthlyTrend: {
      labels: ["2021", "2022", "2023", "2024"],
      data: [8500, 11200, 12800, 13178.9],
    },
    dailyPattern: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 20),
  },
}

export function getAnalyticsData(period: FilterPeriod) {
  return mockData[period]
}

export function generateSpendingByCategory(period: FilterPeriod): ChartData {
  const data = getAnalyticsData(period)
  return {
    labels: data.categoryData.map((item) => item.label),
    datasets: [
      {
        data: data.categoryData.map((item) => item.value),
        backgroundColor: data.categoryData.map((item) => item.color),
        borderWidth: 0,
        cutout: "60%",
      },
    ],
  }
}

export function generateMonthlyTrend(period: FilterPeriod): ChartData {
  const data = getAnalyticsData(period)
  return {
    labels: data.monthlyTrend.labels,
    datasets: [
      {
        label: "Spending",
        data: data.monthlyTrend.data,
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderColor: "#6366F1",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  }
}

export function generateDailyPattern(period: FilterPeriod): ChartData {
  const data = getAnalyticsData(period)
  const labels =
    period === "thisYear" || period === "lastYear"
      ? Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`)
      : Array.from({ length: data.dailyPattern.length }, (_, i) => `${i + 1}`)

  return {
    labels,
    datasets: [
      {
        label: "Daily Spending",
        data: data.dailyPattern,
        backgroundColor: "#6366F1",
        borderRadius: 4,
      },
    ],
  }
}

export function generateCategoryTrends(period: FilterPeriod): ChartData {
  const baseLabels =
    period === "thisMonth"
      ? ["Week 1", "Week 2", "Week 3", "Week 4"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return {
    labels: baseLabels,
    datasets: [
      {
        label: "Food",
        data: Array.from({ length: baseLabels.length }, () => Math.floor(Math.random() * 200) + 50),
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
      },
      {
        label: "Transportation",
        data: Array.from({ length: baseLabels.length }, () => Math.floor(Math.random() * 180) + 40),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
      {
        label: "Entertainment",
        data: Array.from({ length: baseLabels.length }, () => Math.floor(Math.random() * 120) + 30),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
      },
      {
        label: "Shopping",
        data: Array.from({ length: baseLabels.length }, () => Math.floor(Math.random() * 150) + 35),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  }
}
