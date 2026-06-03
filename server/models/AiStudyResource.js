import mongoose from "mongoose";

const aiStudyResourceSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["study_notes", "flashcards"],
      required: true,
    },

    notes: {
      summary: {
        type: String,
        default: "",
      },

      keyPoints: {
        type: [String],
        default: [],
      },

      importantTerms: [
        {
          term: {
            type: String,
            default: "",
          },

          definition: {
            type: String,
            default: "",
          },
        },
      ],

      revisionChecklist: {
        type: [String],
        default: [],
      },

      practiceQuestions: {
        type: [String],
        default: [],
      },
    },

    flashcards: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },

        answer: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

aiStudyResourceSchema.index(
  {
    user: 1,
    course: 1,
    type: 1,
  },
  {
    unique: true,
  },
);

const AiStudyResource = mongoose.model(
  "AiStudyResource",
  aiStudyResourceSchema,
);

export default AiStudyResource;