"use client"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined"
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined"
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined"
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

interface User {
  firstName?: string
  lastName?: string
  title?: string
  email?: string
  profileImage?: string
}

interface SidebarProps {
  onLogout?: () => void
  onEditProfile?: () => void
}

export default function Sidebar({ onLogout, onEditProfile }: SidebarProps) {
  const [user, setUser] = useState<User>({})
  const [profilePhoto, setProfilePhoto] = useState<string>("")
  const pathname = usePathname()

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)
        setUser({
          firstName: parsed.firstName || "",
          lastName: parsed.lastName || "",
          email: parsed.email || "",
          title: parsed.title || "Manager"
        })
        setProfilePhoto(parsed.profileImage || "")
      }
    }

    // Load initial data
    loadUserData()

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedProfile = event.detail
      setUser({
        firstName: updatedProfile.firstName || "",
        lastName: updatedProfile.lastName || "",
        email: updatedProfile.email || "",
        title: updatedProfile.title || "Manager"
      })
      setProfilePhoto(updatedProfile.profileImage || "")
    }

    window.addEventListener("profileUpdated", handleProfileUpdate as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate as EventListener)
    }
  }, [])

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <HomeOutlinedIcon /> },
    { name: "Profile", href: "/dashboard/profile", icon: <AccountCircleOutlinedIcon /> },
    { name: "Categories", href: "/dashboard/categories", icon: <LocalOfferOutlinedIcon /> },
    { name: "Expenses", href: "/dashboard/expenses", icon: <FormatListBulletedOutlinedIcon /> },
    { name: "Analytics", href: "/dashboard/analytics", icon: <BarChartOutlinedIcon /> },
  ]

  // Check if the profile photo is from an external source or a placeholder

  return (
    <aside className="w-60 bg-white shadow-md flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {profilePhoto && !profilePhoto.includes("placeholder.svg") ? (
              <Image
                src={profilePhoto}
                alt="Profile"
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-blue-600 text-xl font-medium">
                          ${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}
                        </span>
                      </div>
                    `
                  }
                }}
              />
            ) : user?.firstName || user?.lastName ? (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-xl font-medium">
                  {user?.firstName?.[0] || ""}
                  {user?.lastName?.[0] || ""}
                </span>
              </div>
            ) : (
              <AccountCircleOutlinedIcon className="w-6 h-6 text-gray-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "User Name"}
            </h3>
            <p className="text-sm text-gray-500">{user?.title || "Manager"}</p>
          </div>
        </div>
        
        {onEditProfile && (
          <button
            onClick={onEditProfile}
            className="w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors bg-[#001571] text-white hover:bg-[#001571]/90"
          >
            <ModeEditOutlinedIcon className="w-4 h-4" />
            <span className="text-sm">Edit Profile</span>
            <ArrowRightAltIcon className="w-4 h-4 ml-2" />
          </button>
        )}
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
                    isActive
                      ? "bg-[#001571] text-white font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
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
      {onLogout && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <LogoutOutlinedIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  )
}