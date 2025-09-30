"use client"

import { useState, useEffect } from "react"
import { categoryAPI } from "@/lib/api-client"

export interface Category {
  _id: string
  userId: string // Should be mongoose.Types.ObjectId in backend, but string for client interface is fine if that's how it's sent
  name: string
  emoji: string
  color: string
  createdAt: string
  updatedAt: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await categoryAPI.getAll()
      setCategories(data.categories || [])
    } catch (err) { // err is 'unknown'
      setError(err instanceof Error ? err.message : "Failed to fetch categories")
      console.error("Error fetching categories:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const addCategory = async (category: { name: string; emoji: string; color: string }) => {
    try {
      const data = await categoryAPI.create(category)
      setCategories((prev) => [data.category, ...prev])
      return data.category
    } catch (err) { // err is 'unknown'
      throw err
    }
  }

  const updateCategory = async (id: string, updates: { name?: string; emoji?: string; color?: string }) => {
    try {
      const data = await categoryAPI.update(id, updates)
      setCategories((prev) => prev.map((cat) => (cat._id === id ? data.category : cat)))
      return data.category
    } catch (err) { // err is 'unknown'
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoryAPI.delete(id)
      setCategories((prev) => prev.filter((cat) => cat._id !== id))
    } catch (err) { // err is 'unknown'
      throw err
    }
  }

  useEffect(() => {
    fetchCategories()
  }, []) // Empty dependency array means this runs once on mount

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}