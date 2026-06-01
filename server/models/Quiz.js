import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return value.length >= 2;
        },
        message: "At least two options are required",
      },
    },

    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    explanation: {
      type: String,
      trim: true,
      default: "",
    },

    points: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lessonId: {
      type: String,
      default: "",
    },

    sectionId: {
      type: String,
      default: "",
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    passingPercentage: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },

    timeLimitMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    source: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },

    aiPrompt: {
      type: String,
      trim: true,
      default: "",
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

quizSchema.index({ course: 1 });
quizSchema.index({ instructor: 1 });
quizSchema.index({ course: 1, lessonId: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
