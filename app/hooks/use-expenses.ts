"use client"

import { useState, useEffect } from "react"
import { expenseAPI } from "@/lib/api-client"

export interface Expense {
  _id: string
  userId: string
  amount: number
  date: string
  category: string
  emoji: string
  description: string
  createdAt: string
  updatedAt: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await expenseAPI.getAll()
      setExpenses(data.expenses || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch expenses")
      console.error("Error fetching expenses:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const addExpense = async (expense: {
    amount: number
    date: string
    category: string
    emoji: string
    description: string
  }) => {
    try {
      const data = await expenseAPI.create(expense)
      setExpenses((prev) => [data.expense, ...prev])
      return data.expense
    } catch (err) {
      throw err
    }
  }

  const updateExpense = async (
    id: string,
    updates: {
      amount?: number
      date?: string
      category?: string
      emoji?: string
      description?: string
    },
  ) => {
    try {
      const data = await expenseAPI.update(id, updates)
      setExpenses((prev) => prev.map((exp) => (exp._id === id ? data.expense : exp)))
      return data.expense
    } catch (err) {
      throw err
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      await expenseAPI.delete(id)
      setExpenses((prev) => prev.filter((exp) => exp._id !== id))
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}
