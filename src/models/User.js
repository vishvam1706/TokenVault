import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    providerId: {
      type: String,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically tracks createdAt (signup date) and updatedAt
  }
);

// Prevent OverwriteModelError in Next.js dev hot-reload
export default mongoose.models.User || mongoose.model("User", UserSchema);
