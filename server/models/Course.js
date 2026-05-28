import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPreviewFree: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const reviewSchema = new mongoose.Schema(
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
  },
  { timestamps: true },
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
    },

    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Course price cannot be negative"],
      default: 0,
    },

    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
      lowercase: true,
    },

    thumbnail: {
      type: String,
      trim: true,
      default: "",
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviews: {
      type: [reviewSchema],
      default: [],
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    sections: {
      type: [sectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.index({ title: "text", category: "text" });

courseSchema.virtual("studentCount").get(function () {
  return this.students?.length || 0;
});

courseSchema.set("toJSON", {
  virtuals: true,
});

courseSchema.set("toObject", {
  virtuals: true,
});

const Course = mongoose.model("Course", courseSchema);

export default Course;