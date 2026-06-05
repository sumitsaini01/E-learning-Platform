import mongoose from "mongoose";

const readinessBreakdownSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const jobReadinessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    level: {
      type: String,
      enum: ["not-ready", "getting-ready", "job-ready", "strong-candidate"],
      default: "not-ready",
    },

    breakdown: {
      type: [readinessBreakdownSchema],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    gaps: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

jobReadinessSchema.index({ user: 1, createdAt: -1 });

const JobReadiness = mongoose.model("JobReadiness", jobReadinessSchema);

export default JobReadiness;
