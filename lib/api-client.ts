// Utility functions for making authenticated API calls

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken()

  if (!token) {
    throw new Error("No authentication token found. Please login.")
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("authToken")
    localStorage.removeItem("userProfile")
    window.location.href = "/auth/login"
    throw new Error("Session expired. Please login again.")
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
    console.error("[v0] API Error:", {
      url,
      status: response.status,
      error: errorData,
    })
    throw new Error(errorData.error || `Request failed with status ${response.status}`)
  }

  return response
}

// Expense API calls
export const expenseAPI = {
  getAll: async () => {
    const response = await fetchWithAuth("/api/expenses")
    if (!response.ok) throw new Error("Failed to fetch expenses")
    return response.json()
  },

  create: async (expense: {
    amount: number
    date: string
    category: string
    emoji: string
    description: string
  }) => {
    const response = await fetchWithAuth("/api/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    })
    if (!response.ok) throw new Error("Failed to create expense")
    return response.json()
  },

  update: async (
    id: string,
    expense: {
      amount?: number
      date?: string
      category?: string
      emoji?: string
      description?: string
    },
  ) => {
    const response = await fetchWithAuth(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    })
    if (!response.ok) throw new Error("Failed to update expense")
    return response.json()
  },

  delete: async (id: string) => {
    const response = await fetchWithAuth(`/api/expenses/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete expense")
    return response.json()
  },
}

// Category API calls
export const categoryAPI = {
  getAll: async () => {
    try {
      const response = await fetchWithAuth("/api/categories")
      return response.json()
    } catch (error) {
      console.error("[v0] Failed to fetch categories:", error)
      throw error
    }
  },

  create: async (category: { name: string; emoji: string; color: string }) => {
    try {
      console.log("[v0] Creating category:", category)
      const response = await fetchWithAuth("/api/categories", {
        method: "POST",
        body: JSON.stringify(category),
      })
      const data = await response.json()
      console.log("[v0] Category created successfully:", data)
      return data
    } catch (error) {
      console.error("[v0] Failed to create category:", error)
      throw error
    }
  },

  update: async (id: string, category: { name?: string; emoji?: string; color?: string }) => {
    try {
      const response = await fetchWithAuth(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(category),
      })
      return response.json()
    } catch (error) {
      console.error("[v0] Failed to update category:", error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/categories/${id}`, {
        method: "DELETE",
      })
      return response.json()
    } catch (error) {
      console.error("[v0] Failed to delete category:", error)
      throw error
    }
  },
}
