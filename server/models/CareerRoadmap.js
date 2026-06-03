import mongoose from "mongoose";

const roadmapStepSchema = new mongoose.Schema(
  {
    phase: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    recommendedProjects: {
      type: [String],
      default: [],
    },

    estimatedWeeks: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

const careerRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    careerGoal: {
      type: String,
      required: true,
      trim: true,
    },

    currentLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    roadmap: {
      type: [roadmapStepSchema],
      default: [],
    },

    tools: {
      type: [String],
      default: [],
    },

    interviewTopics: {
      type: [String],
      default: [],
    },

    portfolioProjects: {
      type: [String],
      default: [],
    },

    estimatedTimeline: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

careerRoadmapSchema.index({ user: 1, createdAt: -1 });

const CareerRoadmap = mongoose.model("CareerRoadmap", careerRoadmapSchema);

export default CareerRoadmap;
