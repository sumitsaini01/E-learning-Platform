import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["technical", "mcq", "coding", "hr"],
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      default: [],
    },

    correctAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  {
    _id: false,
  },
);

const interviewPrepSchema = new mongoose.Schema(
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

    questions: {
      type: [interviewQuestionSchema],
      default: [],
    },

    preparationTips: {
      type: [String],
      default: [],
    },

    importantTopics: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

interviewPrepSchema.index({ user: 1, createdAt: -1 });

const InterviewPrep = mongoose.model("InterviewPrep", interviewPrepSchema);

export default InterviewPrep;
