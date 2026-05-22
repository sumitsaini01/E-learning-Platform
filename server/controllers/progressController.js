import Course from "../models/Course.js";
import Progress from "../models/Progress.js";

const getTotalLessons = (course) => {
  return course.sections.reduce((total, section) => {
    return total + section.lessons.length;
  }, 0);
};

const findLessonInCourse = (course, lessonId) => {
  for (const section of course.sections) {
    const lesson = section.lessons.id(lessonId);

    if (lesson) {
      return lesson;
    }
  }

  return null;
};

export const markLessonComplete = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lesson = findLessonInCourse(course, lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      });
    }

    const totalLessons = getTotalLessons(course);

    const progress = await Progress.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
      },
      {
        $addToSet: {
          completedLessons: lessonId,
        },
        $set: {
          lastAccessedLesson: lessonId,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const completed = progress.completedLessons.length;

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round((completed / totalLessons) * 100);

    return res.status(200).json({
      success: true,
      message: "Lesson marked as complete",
      progress,
      completed,
      totalLessons,
      percentage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
};

export const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const totalLessons = getTotalLessons(course);

    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    const completed = progress?.completedLessons.length || 0;

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round((completed / totalLessons) * 100);

    return res.status(200).json({
      success: true,
      progress: progress || {
        completedLessons: [],
        lastAccessedLesson: "",
      },
      completed,
      totalLessons,
      percentage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
};