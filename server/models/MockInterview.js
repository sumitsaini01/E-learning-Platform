import mongoose from "mongoose";

const mockInterviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    expectedAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      enum: ["technical", "coding", "project", "hr", "system-design"],
      default: "technical",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    userAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },
  },
  {
    _id: true,
  },
);

const mockInterviewSchema = new mongoose.Schema(
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

    targetCompany: {
      type: String,
      required: true,
      trim: true,
    },

    experienceType: {
      type: String,
      enum: ["fresher", "entry-level", "experienced"],
      required: true,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },

    questions: {
      type: [mockInterviewQuestionSchema],
      default: [],
    },

    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    overallFeedback: {
      type: String,
      default: "",
      trim: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

mockInterviewSchema.index({ user: 1, createdAt: -1 });
mockInterviewSchema.index({ user: 1, targetRole: 1, targetCompany: 1 });

const MockInterview = mongoose.model("MockInterview", mockInterviewSchema);

export default MockInterview;
