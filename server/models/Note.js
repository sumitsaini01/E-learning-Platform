import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
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

    lessonId: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
  },
);

noteSchema.index(
  {
    user: 1,
    course: 1,
    lessonId: 1,
  },
  {
    unique: true,
  },
);

const Note = mongoose.model("Note", noteSchema);

export default Note;