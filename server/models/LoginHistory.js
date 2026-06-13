import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    deviceName: {
      type: String,
      default: "Unknown device",
    },
  },
  {
    timestamps: true,
  },
);

loginHistorySchema.index({ user: 1, createdAt: -1 });
loginHistorySchema.index({ email: 1, createdAt: -1 });

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);

export default LoginHistory;
