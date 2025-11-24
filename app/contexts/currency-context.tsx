"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { formatCurrency, getCurrencySymbol } from "@/lib/currency"

interface CurrencyContextType {
  currency: string
  setCurrency: (currency: string) => void
  formatAmount: (amount: number) => string
  getCurrencySymbol: () => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("USD")

  useEffect(() => {
    // Load currency from user profile in localStorage
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        if (profile.currency) {
          setCurrencyState(profile.currency)
        }
      } catch (error) {
        console.error("Failed to parse user profile:", error)
      }
    }
  }, [])

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency)

    // Update localStorage
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        profile.currency = newCurrency
        localStorage.setItem("userProfile", JSON.stringify(profile))
      } catch (error) {
        console.error("Failed to update currency in profile:", error)
      }
    }
  }

  const formatAmount = (amount: number): string => {
    return formatCurrency(amount, currency)
  }

  const getSymbol = (): string => {
    return getCurrencySymbol(currency)
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        getCurrencySymbol: getSymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}
