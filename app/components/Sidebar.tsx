"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined"
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined"
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt"

interface SidebarProps {
  onLogout?: () => void
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <HomeOutlinedIcon /> },
    { name: "Profile", href: "/dashboard/profile", icon: <AccountCircleOutlinedIcon /> },
    { name: "Categories", href: "/dashboard/categories", icon: <LocalOfferOutlinedIcon /> },
    { name: "Expenses", href: "/dashboard/expenses", icon: <FormatListBulletedOutlinedIcon /> },
    { name: "Analytics", href: "/dashboard/analytics", icon: <BarChartOutlinedIcon /> },
  ]

  return (
    <aside className="w-60 bg-white shadow-md flex flex-col h-full">
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
