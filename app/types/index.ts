// src/types/index.ts
export interface Expense {
  _id: string; 
  userId: string;
  amount: number;
  date: string;
  category: string;
  emoji: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  emoji: string;
  _id: string;
  id: string;
  name: string;
  color: string;
}

export interface CategorySummary {
  label: string;
  value: number;
  color: string;
  percentage: string;
}

export type FilterPeriod = "thisMonth" | "lastMonth" | "thisYear" | "lastYear" | "all";