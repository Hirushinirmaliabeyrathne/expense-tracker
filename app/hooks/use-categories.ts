"use client"

import { useState, useEffect } from "react"
import { categoryAPI } from "@/lib/api-client"
import { Category } from "../types"



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
    } catch (err) { 
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
    } catch (err) { 
      throw err
    }
  }

  const updateCategory = async (id: string, updates: { name?: string; emoji?: string; color?: string }) => {
    try {
      const data = await categoryAPI.update(id, updates)
      setCategories((prev) => prev.map((cat) => (cat._id === id ? data.category : cat)))
      return data.category
    } catch (err) { 
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoryAPI.delete(id)
      setCategories((prev) => prev.filter((cat) => cat._id !== id))
    } catch (err) { 
      throw err
    }
  }

  useEffect(() => {
    fetchCategories()
  }, []) 

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