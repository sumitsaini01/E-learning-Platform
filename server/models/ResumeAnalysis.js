import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
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

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    missingKeywords: {
      type: [String],
      default: [],
    },

    projectSuggestions: {
      type: [String],
      default: [],
    },

    improvementTips: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

resumeAnalysisSchema.index({ user: 1, createdAt: -1 });

const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

export default ResumeAnalysis;
