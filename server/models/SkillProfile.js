import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    sourceCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    quizzesPassed: {
      type: Number,
      default: 0,
    },

    certificatesEarned: {
      type: Number,
      default: 0,
    },

    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const skillProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    skills: {
      type: [skillSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

skillProfileSchema.index({ user: 1 });

const SkillProfile = mongoose.model("SkillProfile", skillProfileSchema);

export default SkillProfile;
