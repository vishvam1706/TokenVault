import mongoose from "mongoose";

const ModelResetSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      enum: [
        "gemini-3-1-pro-high",
        "gemini-3-1-pro-low",
        "gemini-3-flash",
        "gemini-3-5-flash-high",
        "gemini-3-5-flash-low",
        "gemini-3-5-flash-medium",
        "claude-sonnet-4-6",
        "claude-opus-4-6",
        "gpt-oss-120b",
      ],
    },
    resetAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const AccountSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Account email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email is too long"],
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: [50, "Nickname must be 50 characters or fewer"],
      default: "",
    },
    models: {
      type: [ModelResetSchema],
      validate: {
        validator(arr) {
          const keys = arr.map((m) => m.key);
          return new Set(keys).size === keys.length; // no duplicate model keys
        },
        message: "Duplicate model keys are not allowed",
      },
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Compound index — one userId can have many accounts; queries always scope by userId
AccountSchema.index({ userId: 1, createdAt: -1 });

// Prevent OverwriteModelError in Next.js dev hot-reload
export default mongoose.models.Account ||
  mongoose.model("Account", AccountSchema);
