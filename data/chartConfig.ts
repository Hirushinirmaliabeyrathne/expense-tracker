// data/chartConfig.ts
import { type TooltipItem } from "chart.js"

export const pieOptions = {
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

export const areaOptions = {
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

export const barOptions = {
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

export const lineOptions = {
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