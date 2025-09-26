// models/User.ts
import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema({
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
    type: String, // Optional, depending on your signup form
  },
  profileImage: { // New field for profile image URL
    type: String,
    default: "", // Default to empty string if no image
  },
}, { timestamps: true });

const User = models.User || mongoose.model("User", userSchema);
export default User;