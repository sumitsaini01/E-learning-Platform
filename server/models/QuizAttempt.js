import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    selectedOptionIndex: {
      type: Number,
      required: true,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    pointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const attemptQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    questionOrder: {
      type: [attemptQuestionSchema],
      default: [],
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    passed: {
      type: Boolean,
      default: false,
    },

    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
    },
  },
  {
    timestamps: true,
  },
);

quizAttemptSchema.index({
  user: 1,
  quiz: 1,
  attemptNumber: 1,
});
quizAttemptSchema.index({ course: 1 });
quizAttemptSchema.index({ user: 1, course: 1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
