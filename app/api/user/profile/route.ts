// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../../../../models/User";
import { connectDB } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    const { firstName, lastName, email, oldPassword, newPassword, profileImage } = await req.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If changing password, verify old password
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json({ error: "Old password required" }, { status: 400 });
      }
      
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}