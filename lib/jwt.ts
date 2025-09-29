// import jwt from "jsonwebtoken"

// const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

// export interface JWTPayload {
//   userId: string
//   email: string
// }

// export const generateToken = (payload: JWTPayload): string => {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
// }

// export const verifyToken = (token: string): JWTPayload => {
//   return jwt.verify(token, JWT_SECRET) as JWTPayload
// }

// export const getTokenFromRequest = (request: Request): string | null => {
//   const authHeader = request.headers.get("authorization")
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     return authHeader.substring(7)
//   }
//   return null
// }
