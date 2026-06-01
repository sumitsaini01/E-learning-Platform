import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "course_enrolled",
        "lesson_completed",
        "course_completed",
        "quiz_attempted",
        "quiz_passed",
        "certificate_generated",
        "course_created",
        "course_published",
        "student_enrolled",
        "review_added",
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;