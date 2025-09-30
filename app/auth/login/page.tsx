"use client"

import { useState } from "react"
import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [showForgot, setShowForgot] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      alert("Login successful!")

      localStorage.setItem("authToken", data.token)

      // Save user profile data to localStorage
      const userProfileToSave = {
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        email: data.user.email || formData.email,
        profileImage: data.user.profileImage || "",
      }
      localStorage.setItem("userProfile", JSON.stringify(userProfileToSave))

      router.push("/dashboard")
    } catch (err: unknown) {
      let errorMessage = "Something went wrong."
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "object" && err !== null && "error" in err) {
        errorMessage = (err as { error: string }).error
      }
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left Section - Image */}
      <section className="relative hidden md:block">
        <Image src="/image/login.jpg" alt="Login" fill className="object-cover" priority />
      </section>

      {/* Right Section - Login Form */}
      <section className="flex flex-col justify-center items-center px-8 md:px-20 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-[#001571] text-xl font-bold text-center mb-2">
            Welcome Back! Let&apos;s Get You Started.
          </h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
              required
            />
            <div className="text-right">
              <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-[#001571] underline">
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#001571] text-white py-2 rounded-md hover:bg-blue-900 transition disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Logins */}
          <button className="w-full border border-gray-300 flex items-center justify-center gap-2 py-2 rounded-md mb-3 hover:bg-gray-100">
            <Image src="/image/Google.png" alt="Google" width={20} height={20} />
            Sign in with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[#001571] underline hover:text-blue-900">
              Signup here
            </Link>
          </p>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:border-[#001571]"
            />
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                onClick={() => setShowForgot(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-[#001571] text-white rounded-md hover:bg-blue-900 transition">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
