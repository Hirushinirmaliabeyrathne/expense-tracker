"use client"
import Link from "next/link"
import type React from "react"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined"
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined"
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined"
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"

interface User {
  firstName?: string
  lastName?: string
  title?: string
  email?: string
  profileImage?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<User>({})
  const [profilePhoto, setProfilePhoto] = useState<string>("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      const userProfile = {
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        email: parsed.email || "",
        profileImage: parsed.profileImage || "",
      }
      setUser(userProfile)
      setProfilePhoto(parsed.profileImage || "")
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: userProfile }));
    }

    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        setUser((prev) => ({
          ...prev,
          firstName: customEvent.detail.firstName || "",
          lastName: customEvent.detail.lastName || "",
          email: customEvent.detail.email || "",
          profileImage: customEvent.detail.profileImage || "",
        }))
        setProfilePhoto(customEvent.detail.profileImage || "")
        
        localStorage.setItem("userProfile", JSON.stringify(customEvent.detail));
      }
    }

    window.addEventListener("profileUpdated", handleProfileUpdate)

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate)
    }
  }, [])

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <HomeOutlinedIcon /> },
    { name: "Categories", href: "/dashboard/categories", icon: <LocalOfferOutlinedIcon /> },
    { name: "Expenses", href: "/dashboard/expenses", icon: <FormatListBulletedOutlinedIcon /> },
    { name: "Analytics", href: "/dashboard/analytics", icon: <BarChartOutlinedIcon /> },
  ]

  const handleLogout = () => {
    localStorage.removeItem("userProfile")
    console.log("Logout clicked")
    window.location.href = "/auth/login"; 
  }

  // ✅ Extract initials safely
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow-md flex flex-col h-screen">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {/* Conditional rendering for hydration */}
              {isClient ? (
                profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : initials ? (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-xl font-medium">{initials.toUpperCase()}</span>
                  </div>
                ) : (
                  <AccountCircleOutlinedIcon className="w-6 h-6 text-gray-600" />
                )
              ) : (
                // Placeholder for server render
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                  <AccountCircleOutlinedIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {isClient && (user.firstName || user.lastName)
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : "User Name"}
              </h3>
              {/* Email display removed as requested */}
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors bg-[#001571] text-white hover:bg-[#001571]/90"
          >
            <ModeEditOutlinedIcon className="w-4 h-4" />
            <span className="text-sm">Edit Profile</span>
            <ArrowRightAltIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h4 className="text-sm font-semibold text-[#001571] tracking-wider mb-4">Main Menu</h4>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name} className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 w-full rounded-md transition-all duration-200 relative ${
                      isActive ? "bg-[#001571] text-white font-semibold" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1">{item.name}</span>
                    <ArrowRightAltIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <LogoutOutlinedIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 overflow-y-auto h-screen">{children}</main>
    </div>
  )
}