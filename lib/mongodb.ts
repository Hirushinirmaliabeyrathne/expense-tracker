// import mongoose from "mongoose"

// const MONGODB_URI = process.env.MONGODB_URI as string

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable")
// }

// let isConnected = false

// export const connectDB = async () => {
//   if (isConnected) return

//   try {
//     await mongoose.connect(MONGODB_URI)
//     isConnected = true
//     console.log("✅ MongoDB connected")
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error)
//     throw new Error("Failed to connect to MongoDB")
//   }
// }


import mongoose from "mongoose" // Make sure mongoose is imported to use its types
import { MongoClient } from "mongodb" // Make sure MongoClient is imported

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null // Use typeof mongoose for the connection instance
    promise: Promise<typeof mongoose> | null // Use Promise<typeof mongoose> for the promise
  }
  var mongoClientPromise: Promise<MongoClient> | undefined
}

let cached = global.mongooseCache

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null }
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB connected successfully")
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("❌ MongoDB connection error:", e)
    throw e
  }

  return cached.conn
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (!global.mongoClientPromise) {
    client = new MongoClient(MONGODB_URI)
    global.mongoClientPromise = client.connect()
  }
  clientPromise = global.mongoClientPromise
} else {
  client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

export default clientPromise