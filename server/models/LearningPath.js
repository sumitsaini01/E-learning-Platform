import mongoose from "mongoose";

const recommendedCourseSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
  },
  {
    _id: false,
  },
);

const learningPathSchema = new mongoose.Schema(
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

    currentSkillsSnapshot: {
      type: [
        {
          name: String,
          progress: Number,
        },
      ],
      default: [],
    },

    recommendedCourses: {
      type: [recommendedCourseSchema],
      default: [],
    },

    weakSkills: {
      type: [String],
      default: [],
    },

    nextSteps: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

learningPathSchema.index({ user: 1, createdAt: -1 });

const LearningPath = mongoose.model("LearningPath", learningPathSchema);

export default LearningPath;
