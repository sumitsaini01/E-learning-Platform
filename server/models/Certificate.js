import mongoose from "mongoose";
import crypto from "crypto";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },

    instructorName: {
      type: String,
      default: "",
      trim: true,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    completionPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    quizPassed: {
      type: Boolean,
      default: true,
    },

    verificationUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

certificateSchema.index(
  {
    user: 1,
    course: 1,
  },
  {
    unique: true,
  },
);

certificateSchema.pre("validate", function () {
  if (!this.certificateId) {
    this.certificateId = `CERT-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;
  }
});

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;