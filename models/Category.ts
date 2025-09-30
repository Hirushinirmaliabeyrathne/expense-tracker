import mongoose, { Schema, type Document } from "mongoose"

export interface ICategory extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  emoji: string
  color: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: "📝",
    },
    color: {
      type: String,
      default: "#6366F1",
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique category names per user
CategorySchema.index({ userId: 1, name: 1 }, { unique: true })

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)
