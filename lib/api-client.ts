// lib/api-client.ts

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No authentication token found. Please login.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userProfile");
      window.location.href = "/auth/login";
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          // Use the specific error message from the backend ("Category with this name already exists")
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }
      } catch (e) {
        // Failed to parse error body, stick to default message
      }
      
      // FIX: Only log true Server Errors (500+). 
      // Do NOT log validation errors (400) like duplicate categories to the console.
      if (response.status >= 500) {
        console.error("[v0] Server Error:", { url, status: response.status, message: errorMessage });
      }

      // Throw the error so the UI handles it, but don't log it here
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network request failed");
  }
}

// ... Keep your existing expenseAPI and categoryAPI exports exactly as they are ...
export const expenseAPI = {
  getAll: async () => {
    const response = await fetchWithAuth("/api/expenses");
    const data = await response.json();
    return data;
  },

  create: async (expense: {
    amount: number;
    date: string;
    category: string;
    emoji: string;
    description: string;
  }) => {
    const response = await fetchWithAuth("/api/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    return data;
  },

  update: async (
    id: string,
    expense: {
      amount?: number;
      date?: string;
      category?: string;
      emoji?: string;
      description?: string;
    },
  ) => {
    const response = await fetchWithAuth(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    return data;
  },

  delete: async (id: string) => {
    const response = await fetchWithAuth(`/api/expenses/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  },
};

export const categoryAPI = {
  getAll: async () => {
    const response = await fetchWithAuth("/api/categories");
    const data = await response.json();
    return data.categories || data;
  },

  create: async (category: { name: string; emoji: string; color: string }) => {
    const response = await fetchWithAuth("/api/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
    const data = await response.json();
    return data.category || data;
  },

  update: async (id: string, category: { name?: string; emoji?: string; color?: string }) => {
    const response = await fetchWithAuth(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    });
    const data = await response.json();
    return data.category || data;
  },

  delete: async (id: string) => {
    const response = await fetchWithAuth(`/api/categories/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  },
};