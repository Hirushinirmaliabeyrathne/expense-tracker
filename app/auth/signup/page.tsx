"use client"

import { useState } from "react"
import type React from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"

export default function SignUpForm() {
  const [contactNumber, setContactNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, contactNumber }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")

      alert("Signup successful! Please login.")
      router.push("/auth/login")
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message)
      else alert("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#001571] text-center">
            Create Account
          </h2>
          <p className="text-center text-gray-600 mt-2">Join us today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <div className="w-full border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#037D40] focus-within:border-transparent">
              <PhoneInput
                defaultCountry="lk"
                value={contactNumber}
                onChange={setContactNumber}
                disabled={isLoading}
                inputProps={{
                  id: "contactNumber",
                  name: "contactNumber",
                }}
                inputStyle={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "16px",
                  padding: "12px 16px",
                  backgroundColor: "transparent",
                }}
                countrySelectorStyleProps={{
                  buttonStyle: {
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    padding: "12px 8px",
                  },
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/auth/login"
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-center"
            >
              Back to Login
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#001571] text-white py-2 rounded-md hover:bg-blue-900 transition disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Register"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#001571] underline hover:text-blue-900"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
