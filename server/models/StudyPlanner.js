import mongoose from "mongoose";

const studyPlanDaySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    tasks: {
      type: [String],
      default: [],
    },

    topics: {
      type: [String],
      default: [],
    },

    estimatedHours: {
      type: Number,
      default: 1,
      min: 0.5,
    },

    resources: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const studyPlannerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    goal: {
      type: String,
      required: true,
      trim: true,
    },

    targetRole: {
      type: String,
      default: "",
      trim: true,
    },

    durationDays: {
      type: Number,
      required: true,
      min: 1,
      max: 180,
    },

    hoursPerDay: {
      type: Number,
      required: true,
      min: 0.5,
      max: 12,
    },

    currentLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    plan: {
      type: [studyPlanDaySchema],
      default: [],
    },

    milestones: {
      type: [String],
      default: [],
    },

    revisionStrategy: {
      type: [String],
      default: [],
    },

    finalOutcome: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

studyPlannerSchema.index({ user: 1, createdAt: -1 });

const StudyPlanner = mongoose.model("StudyPlanner", studyPlannerSchema);

export default StudyPlanner;
