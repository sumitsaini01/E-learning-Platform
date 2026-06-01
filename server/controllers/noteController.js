import Course from "../models/Course.js";
import Note from "../models/Note.js";

const sendServerError = (res, message, error) => {
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production"
      ? undefined
      : error.message,
  });
};

export const getLessonNote = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const note = await Note.findOne({
      user: req.user._id,
      course: courseId,
      lessonId,
    });

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to fetch note",
      error,
    );
  }
};

export const saveLessonNote = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title = "", content = "" } = req.body;

    if (!content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const note = await Note.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
        lessonId,
      },
      {
        title: title.trim(),
        content: content.trim(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Note saved successfully",
      note,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to save note",
      error,
    );
  }
};

export const getCourseNotes = async (req, res) => {
  try {
    const { courseId } = req.params;

    const notes = await Note.find({
      user: req.user._id,
      course: courseId,
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to fetch notes",
      error,
    );
  }
};

export const deleteLessonNote = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    await Note.findOneAndDelete({
      user: req.user._id,
      course: courseId,
      lessonId,
    });

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to delete note",
      error,
    );
  }
};