"use client"

import { useState } from "react"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

export type FilterPeriod = "thisMonth" | "thisYear" | "lastMonth" | "lastYear" | "all"

interface AnalyticsFilterProps {
  selectedFilter: FilterPeriod
  onFilterChange: (filter: FilterPeriod) => void
}

export default function AnalyticsFilter({ selectedFilter, onFilterChange }: AnalyticsFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const filterOptions = [
    { value: "thisMonth" as FilterPeriod, label: "This Month" },
    { value: "lastMonth" as FilterPeriod, label: "Last Month" },
    { value: "thisYear" as FilterPeriod, label: "This Year" },
    { value: "lastYear" as FilterPeriod, label: "Last Year" },
    { value: "all" as FilterPeriod, label: "All Time" },
  ]

  const selectedOption = filterOptions.find((option) => option.value === selectedFilter)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{selectedOption?.label}</span>
        <KeyboardArrowDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onFilterChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    selectedFilter === option.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
