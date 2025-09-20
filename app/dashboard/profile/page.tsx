"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import Image from "next/image"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  oldPassword: string
  newPassword: string
  profileImage: string
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    profileImage: "",
  })

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      setProfile((prev) => ({
        ...prev,
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        email: parsed.email || "",
        profileImage: parsed.profileImage || "",
      }))
    }
  }, [])

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Upload failed")
    }

    const data = await response.json()
    return data.url
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Please select an image smaller than 5MB.", "error")
      return
    }

    setImageUploading(true)

    try {
      const imageUrl = await uploadToCloudinary(file)
      const updatedProfile = {
        ...profile,
        profileImage: imageUrl,
      }
      
      setProfile(updatedProfile)

      // Save to localStorage immediately
      const profileData = {
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        profileImage: imageUrl,
      }
      localStorage.setItem("userProfile", JSON.stringify(profileData))

      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: profileData }))

      showToast("Your profile image has been updated.", "success")
    } catch (error) {
      console.error("Error uploading image:", error)
      showToast("Failed to upload image. Please try again.", "error")
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveImage = () => {
    const updatedProfile = {
      ...profile,
      profileImage: "",
    }
    
    setProfile(updatedProfile)

    // Save to localStorage immediately
    const profileData = {
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      email: updatedProfile.email,
      profileImage: "",
    }
    localStorage.setItem("userProfile", JSON.stringify(profileData))

    // Dispatch event to update sidebar
    window.dispatchEvent(new CustomEvent("profileUpdated", { detail: profileData }))

    showToast("Profile image removed.", "success")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        profileImage: profile.profileImage,
      }

      localStorage.setItem("userProfile", JSON.stringify(profileData))

      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: profileData }))

      showToast("Your profile information has been saved.", "success")

      setProfile((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
      }))
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast("Failed to update profile. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render profile image or initials
  const renderProfileDisplay = () => {
    if (profile.profileImage && !profile.profileImage.includes("placeholder.svg")) {
      return (
        <Image 
          src={profile.profileImage} 
          alt="Profile" 
          fill 
          className="object-cover"
          onError={(e) => {
            // If image fails to load, show initials
            const target = e.target as HTMLImageElement
            target.style.display = "none"
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-blue-600 text-4xl font-medium">
                    ${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}
                  </span>
                </div>
              `
            }
          }}
        />
      )
    } else if (profile.firstName || profile.lastName) {
      return (
        <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 text-4xl font-medium">
            {profile.firstName?.[0] || ""}{profile.lastName?.[0] || ""}
          </span>
        </div>
      )
    } else {
      return (
        <Image 
          src="/placeholder.svg" 
          alt="Profile" 
          fill 
          className="object-cover" 
        />
      )
    }
  }

  return (
    <div className="p-4 max-[320px]:p-2 max-[375px]:p-3 max-[425px]:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toastMessage.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toastMessage.message}
        </div>
      )}

      <div className="w-full bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl max-[320px]:text-xl max-[375px]:text-xl max-[425px]:text-2xl font-bold text-gray-800">
            Profile Settings
          </h1>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 max-[320px]:w-24 max-[320px]:h-24 max-[375px]:w-28 max-[375px]:h-28 max-[425px]:w-32 max-[425px]:h-32 rounded-full overflow-hidden border-4 border-gray-200 relative">
                  {renderProfileDisplay()}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="absolute bottom-0 right-0 bg-[#001571] text-white p-2 rounded-full hover:bg-[#001571]/90 transition-colors disabled:opacity-50"
                >
                  {imageUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <EditIcon className="w-5 h-5" />
                  )}
                </button>
                {profile.profileImage && !profile.profileImage.includes("placeholder.svg") && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute bottom-0 left-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <DeleteIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="flex items-center gap-2 text-[#001571] hover:text-[#001571]/80 transition-colors disabled:opacity-50"
                >
                  <FileUploadOutlinedIcon />
                  <span className="max-[320px]:text-sm max-[375px]:text-sm max-[425px]:text-base">
                    {imageUploading ? "Uploading..." : "Upload Profile Picture"}
                  </span>
                </button>
                {profile.profileImage && !profile.profileImage.includes("placeholder.svg") && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors mt-2"
                  >
                    <DeleteIcon />
                    <span className="max-[320px]:text-sm max-[375px]:text-sm max-[425px]:text-base">Remove Image</span>
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max. 5MB)</p>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[320px]:gap-3 max-[375px]:gap-3 max-[425px]:gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001571] focus:border-[#001571]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001571] focus:border-[#001571]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001571] focus:border-[#001571]"
              />
              <p className="text-xs text-gray-500">Enter your email address</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[320px]:gap-3 max-[375px]:gap-3 max-[425px]:gap-4">
              <div className="space-y-2">
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={profile.oldPassword}
                  onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001571] focus:border-[#001571]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={profile.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001571] focus:border-[#001571]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#001571] hover:bg-[#001571]/90 text-white px-8 py-2 max-[320px]:px-6 max-[320px]:py-2 max-[375px]:px-6 max-[375px]:py-2 max-[425px]:px-8 max-[425px]:py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </div>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}