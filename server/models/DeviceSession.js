import mongoose from "mongoose";

const deviceSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
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

    isActive: {
      type: Boolean,
      default: true,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

deviceSessionSchema.index({ user: 1, isActive: 1 });
deviceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DeviceSession = mongoose.model("DeviceSession", deviceSessionSchema);

export default DeviceSession;
