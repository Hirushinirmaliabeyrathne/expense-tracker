"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Image from "next/image"
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
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

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
    } catch (error: unknown) {
      console.error("Error uploading image:", error)
      let errorMessage = "Failed to upload image. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = (error as { message: string }).message
      }
      showToast(errorMessage, "error")
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

    if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim()) {
      showToast("Please fill in all required fields.", "error")
      return
    }

    if (profile.newPassword && !profile.oldPassword) {
      showToast("Please enter your old password to change password.", "error")
      return
    }

    if (profile.oldPassword && !profile.newPassword) {
      showToast("Please enter a new password.", "error")
      return
    }

    setIsLoading(true)

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        showToast("Not authenticated. Please login again.", "error")
        window.location.href = "/auth/login"
        return
      }

      // Call API to update profile in MongoDB
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          oldPassword: profile.oldPassword,
          newPassword: profile.newPassword,
          profileImage: profile.profileImage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error messages from backend
        if (response.status === 401 && data.error === "Current password is incorrect") {
          showToast("Current password is incorrect. Please try again.", "error")
        } else {
          showToast(data.error || "Failed to update profile", "error")
        }
        return
      }

      // Save to localStorage (cache)
      const profileData = {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        profileImage: data.user.profileImage,
      }
      localStorage.setItem("userProfile", JSON.stringify(profileData))

      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: profileData }))

      // Clear password fields
      setProfile((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
      }))

      showToast("Profile updated successfully!", "success")
    } catch (error) {
      console.error("Error updating profile:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again."
      showToast(errorMessage, "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#001571] px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-blue-100 mt-2">Manage your account information and preferences</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture Section */}
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                    )}
                  </div>

                  {imageUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Picture</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a profile picture. Max file size: 5MB. Supported formats: JPG, PNG, GIF.
                  </p>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <EditIcon className="mr-2 h-4 w-4" />
                      {imageUploading ? "Uploading..." : "Change Picture"}
                    </button>

                    {profile.profileImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <DeleteIcon className="mr-2 h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        id="oldPassword"
                        value={profile.oldPassword}
                        onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showOldPassword ? (
                          <VisibilityOffIcon className="h-5 w-5" />
                        ) : (
                          <VisibilityIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        value={profile.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <VisibilityOffIcon className="h-5 w-5" />
                        ) : (
                          <VisibilityIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Leave blank if you don&apos;t want to change your password</p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#001571] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#001571]/90"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-4 right-4 max-w-sm w-full bg-white border-l-4 ${
            toastMessage.type === "success" ? "border-green-400" : "border-red-400"
          } rounded-lg shadow-lg transform transition-all duration-300 ease-in-out`}
        >
          <div className="p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {toastMessage.type === "success" ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${toastMessage.type === "success" ? "text-green-800" : "text-red-800"}`}>
                  {toastMessage.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}