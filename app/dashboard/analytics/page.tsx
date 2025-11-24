// // app/analytics/AnalyticsPage.tsx
// "use client"

// import { useState } from "react"
// import { Pie, Bar, Line } from "react-chartjs-2"
// import AnalyticsFilter, { type FilterPeriod } from "../../components/analyticsfilter"
// import { useAnalyticsData } from "../../hooks/use-analytics-data" 
// import {
//   pieOptions,
//   areaOptions,
//   barOptions,
//   lineOptions,
// } from "../../../data/chartConfig" 

// export default function AnalyticsPage() {
//   const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>("thisMonth")

//   // Use the new custom hook to get all analytics data
//   const {
//     isLoading,
//     totalSpending,
//     monthlyAverage,
//     dailyAverage,
//     topCategoryName,
//     topCategoryAmount,
//     spendingByCategory,
//     monthlyTrend,
//     dailyPattern,
//     categoryTrends,
//     categoryData,
//   } = useAnalyticsData(selectedFilter)

//   return (
//     <div className="p-6 ">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-4">
//           <div>
//             <h1 className="text-2xl font-bold">Analytics & Insights</h1>
//             <p className="text-gray-600">Deep dive into your spending patterns and trends</p>
//           </div>
//         </div>
//         <AnalyticsFilter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
//           <div className="text-sm font-medium text-gray-600 mb-1">Total Spending</div>
//           <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
//           <div className="text-xs text-gray-500">
//             {selectedFilter === "all"
//               ? "All time total"
//               : selectedFilter === "thisYear" || selectedFilter === "lastYear"
//                 ? "Year total"
//                 : "Period total"}
//           </div>
//         </div>
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
//           <div className="text-sm font-medium text-gray-600 mb-1">Monthly Average</div>
//           <div className="text-2xl font-bold">${monthlyAverage.toFixed(2)}</div>
//           <div className="text-xs text-gray-500">Per month</div>
//         </div>
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
//           <div className="text-sm font-medium text-gray-600 mb-1">Daily Average</div>
//           <div className="text-2xl font-bold">${dailyAverage.toFixed(2)}</div>
//           <div className="text-xs text-gray-500">Per day</div>
//         </div>
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
//           <div className="text-sm font-medium text-gray-600 mb-1">Top Category</div>
//           <div className="text-2xl font-bold">{topCategoryName}</div>
//           <div className="text-xs text-gray-500">${topCategoryAmount.toFixed(2)}</div>
//         </div>
//       </div>

//       {/* Charts Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Spending by Category */}
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
//           <h3 className="text-lg font-semibold mb-1">Spending by Category</h3>
//           <p className="text-sm text-gray-500 mb-6">Your spending breakdown by categories</p>

//           <div className="h-64 mb-6">
//             {isLoading ? (
//               <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
//             ) : spendingByCategory ? (
//               <Pie data={spendingByCategory} options={pieOptions} />
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
//             )}
//           </div>

//           <div className="space-y-3">
//             {categoryData.map((item) => (
//               <div key={item.label} className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
//                   <span className="text-sm text-gray-600">{item.label}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm font-medium">${item.value.toFixed(2)}</span>
//                   <span className="text-xs text-gray-500">{item.percentage}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Monthly Spending Trend */}
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
//           <h3 className="text-lg font-semibold mb-1">
//             {selectedFilter === "thisMonth" || selectedFilter === "lastMonth" ? "Weekly" : "Monthly"} Spending Trend
//           </h3>
//           <p className="text-sm text-gray-500 mb-6">Your spending trend over time</p>

//           <div className="h-64">
//             {isLoading ? (
//               <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
//             ) : monthlyTrend ? (
//               <Line data={monthlyTrend} options={areaOptions} />
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Daily Spending Pattern */}
//       <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
//         <h3 className="text-lg font-semibold mb-1">
//           {selectedFilter === "thisYear" || selectedFilter === "lastYear" ? "Monthly" : "Daily"} Spending Pattern -{" "}
//           {selectedFilter === "thisMonth"
//             ? "This Month"
//             : selectedFilter === "lastMonth"
//               ? "Last Month"
//               : selectedFilter === "thisYear"
//                 ? "This Year"
//                 : selectedFilter === "lastYear"
//                   ? "Last Year"
//                   : "All Time"}
//         </h3>
//         <p className="text-sm text-gray-500 mb-6">
//           Your {selectedFilter === "thisYear" || selectedFilter === "lastYear" ? "monthly" : "daily"} spending
//           throughout the period
//         </p>

//         <div className="h-80">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
//           ) : dailyPattern ? (
//             <Bar data={dailyPattern} options={barOptions} />
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
//           )}
//         </div>
//       </div>

//       {/* Category Spending Trends */}
//       <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
//         <h3 className="text-lg font-semibold mb-1">Category Spending Trends</h3>
//         <p className="text-sm text-gray-500 mb-6">How your spending by category changed over time</p>

//         <div className="h-80">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
//           ) : categoryTrends ? (
//             <Line data={categoryTrends} options={lineOptions} />
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
//           )}
//         </div>
//       </div>

//       {/* Insights Footer */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
//           <div className="text-2xl mb-2">📈</div>
//           <div className="text-sm font-medium text-gray-600">Highest Spending Day</div>
//           <div className="text-lg font-bold">
//             {selectedFilter === "thisMonth" ? "This Month" : selectedFilter === "thisYear" ? "This Year" : "Best Day"}
//           </div>
//           <div className="text-xs text-gray-500">${(dailyAverage * 2.4).toFixed(2)} spent</div>
//         </div>
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
//           <div className="text-2xl mb-2">📉</div>
//           <div className="text-sm font-medium text-gray-600">Lowest Spending Category</div>
//           <div className="text-lg font-bold">
//             {categoryData.length > 0
//               ? categoryData.reduce((min, item) => (item.value < min.value ? item : min)).label
//               : "N/A"}
//           </div>
//           <div className="text-xs text-gray-500">
//             $
//             {categoryData.length > 0
//               ? categoryData.reduce((min, item) => (item.value < min.value ? item : min)).value.toFixed(2)
//               : "0.00"}{" "}
//             total
//           </div>
//         </div>
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
//           <div className="text-2xl mb-2">🔄</div>
//           <div className="text-sm font-medium text-gray-600">Spending Frequency</div>
//           <div className="text-lg font-bold">
//             {/* This calculation should ideally be part of analyticsCalculations */}
//             {totalSpending > 0 && dailyAverage > 0 ? (totalSpending / dailyAverage / 30).toFixed(1) : "0.0"} times/day
//           </div>
//           <div className="text-xs text-gray-500">Average transactions</div>
//         </div>
//       </div>
//     </div>
//   )
// }


// app/analytics/AnalyticsPage.tsx
"use client"

import { useState } from "react"
import { Pie, Bar, Line } from "react-chartjs-2"
import AnalyticsFilter, { type FilterPeriod } from "../../components/analyticsfilter"
import { useAnalyticsData } from "../../hooks/use-analytics-data"
import {
  pieOptions,
  areaOptions,
  barOptions,
  lineOptions,
  chartColors, 
} from "../../../data/chartConfig"

export default function AnalyticsPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>("thisMonth")

  // Use the new custom hook to get all analytics data
  const {
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
  } = useAnalyticsData(selectedFilter)

  // --- APPLY CUSTOM COLORS TO DATA ---

  // 1. Pie Chart: Apply the full color palette
  const coloredPieData = spendingByCategory
    ? {
        ...spendingByCategory,
        datasets: spendingByCategory.datasets.map((ds) => ({
          ...ds,
          backgroundColor: chartColors,
          borderWidth: 0,
        })),
      }
    : null

  // 2. Monthly Trend (Line): Use the 4th color (Blue #0075aa)
  const coloredMonthlyTrend = monthlyTrend
    ? {
        ...monthlyTrend,
        datasets: monthlyTrend.datasets.map((ds) => ({
          ...ds,
          borderColor: chartColors[3],
          backgroundColor: chartColors[3], // formatting for area fill if needed
          pointBackgroundColor: chartColors[3],
        })),
      }
    : null

  // 3. Daily Pattern (Bar): Use the 4th color (Blue #0075aa)
  const coloredDailyPattern = dailyPattern
    ? {
        ...dailyPattern,
        datasets: dailyPattern.datasets.map((ds) => ({
          ...ds,
          backgroundColor: chartColors[3],
        })),
      }
    : null

  // 4. Category Trends (Multi-Line): Cycle through the colors
  const coloredCategoryTrends = categoryTrends
    ? {
        ...categoryTrends,
        datasets: categoryTrends.datasets.map((ds, index) => ({
          ...ds,
          borderColor: chartColors[index % chartColors.length],
          backgroundColor: chartColors[index % chartColors.length],
        })),
      }
    : null

  // 5. Category Legend Data: Sync colors with the Pie chart
  const coloredCategoryData = categoryData.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
  }))

  // -----------------------------------

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
            ) : coloredPieData ? (
              <Pie data={coloredPieData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
            )}
          </div>

          <div className="space-y-3">
            {coloredCategoryData.map((item) => (
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
            ) : coloredMonthlyTrend ? (
              <Line data={coloredMonthlyTrend} options={areaOptions} />
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
          ) : coloredDailyPattern ? (
            <Bar data={coloredDailyPattern} options={barOptions} />
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
          ) : coloredCategoryTrends ? (
            <Line data={coloredCategoryTrends} options={lineOptions} />
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
            {totalSpending > 0 && dailyAverage > 0 ? (totalSpending / dailyAverage / 30).toFixed(1) : "0.0"} times/day
          </div>
          <div className="text-xs text-gray-500">Average transactions</div>
        </div>
      </div>
    </div>
  )
}