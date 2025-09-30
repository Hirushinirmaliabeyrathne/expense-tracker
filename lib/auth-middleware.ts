import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export interface AuthenticatedRequest extends NextRequest {
  userId?: string
}

export interface JWTPayload {
  id: string
  email: string
}

/**
 * Middleware to verify JWT token and extract user ID
 * Usage: const { userId, error } = await verifyAuth(request)
 */
export async function verifyAuth(request: NextRequest): Promise<{
  userId: string | null
  error: NextResponse | null
}> {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        userId: null,
        error: NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 }),
      }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined")
      return {
        userId: null,
        error: NextResponse.json({ error: "Server configuration error" }, { status: 500 }),
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload

    if (!decoded.id) {
      return {
        userId: null,
        error: NextResponse.json({ error: "Invalid token payload" }, { status: 401 }),
      }
    }

    return {
      userId: decoded.id,
      error: null,
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        userId: null,
        error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
      }
    }

    if (error instanceof jwt.TokenExpiredError) {
      return {
        userId: null,
        error: NextResponse.json({ error: "Token expired" }, { status: 401 }),
      }
    }

    console.error("Auth middleware error:", error)
    return {
      userId: null,
      error: NextResponse.json({ error: "Authentication failed" }, { status: 500 }),
    }
  }
}
