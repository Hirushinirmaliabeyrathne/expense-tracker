// models/User.ts
import mongoose, { Schema, models } from "mongoose"

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
)

const User = models.User || mongoose.model("User", userSchema)
export default User
