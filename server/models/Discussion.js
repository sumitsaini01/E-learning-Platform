import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  },
);

const discussionSchema = new mongoose.Schema(
  {
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

    name: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    isResolved: {
      type: Boolean,
      default: false,
    },

    replies: {
      type: [replySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

discussionSchema.index({ course: 1 });
discussionSchema.index({ user: 1 });

const Discussion = mongoose.model(
  "Discussion",
  discussionSchema,
);

export default Discussion;