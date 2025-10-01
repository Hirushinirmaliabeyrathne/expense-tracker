// api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../../../models/User";
import { connectDB } from "../../../../lib/mongodb";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, confirmPassword, contactNumber } =
      await req.json();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // Password validation (at least 8 chars, includes numbers & symbols)
    const strongPasswordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters, include a number and a special character" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber: contactNumber || "", 
      profileImage: "", 
    });

    return NextResponse.json(
      { message: "User registered successfully", user: { email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}