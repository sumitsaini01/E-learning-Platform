import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
  {
    lessonId: {
      type: String,
      required: true,
    },

    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const progressSchema = new mongoose.Schema(
  {
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

    completedLessons: {
      type: [String],
      default: [],
    },

    lessonProgress: {
      type: [lessonProgressSchema],
      default: [],
    },

    lastAccessedLesson: {
      type: String,
      default: "",
    },

    lastAccessedSection: {
      type: String,
      default: "",
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

progressSchema.index(
  {
    user: 1,
    course: 1,
  },
  {
    unique: true,
  },
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;