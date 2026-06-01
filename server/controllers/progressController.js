import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import { createActivity } from "../utils/activityHelper.js";
import User from "../models/User.js";

const isStudentEnrolled = (course, userId) => {
  return course.students.some(
    (studentId) => studentId.toString() === userId.toString(),
  );
};

const getAllLessons = (course) => {
  const lessons = [];

  course.sections.forEach((section) => {
    section.lessons.forEach((lesson) => {
      lessons.push({
        lessonId: lesson._id.toString(),
        sectionId: section._id.toString(),
        sectionTitle: section.title,
        lessonTitle: lesson.title,
      });
    });
  });

  return lessons;
};

const getTotalLessons = (course) => {
  return getAllLessons(course).length;
};

const findLessonInCourse = (course, lessonId) => {
  for (const section of course.sections) {
    const lesson = section.lessons.id(lessonId);

    if (lesson) {
      return {
        lesson,
        section,
      };
    }
  }

  return null;
};

const calculateProgressSummary = (course, progress) => {
  const totalLessons = getTotalLessons(course);
  const completed = progress?.completedLessons?.length || 0;

  const percentage =
    totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);

  return {
    completed,
    totalLessons,
    percentage,
  };
};

const getNextLesson = (course, lessonId) => {
  const lessons = getAllLessons(course);
  const currentIndex = lessons.findIndex((item) => item.lessonId === lessonId);

  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return null;
  }

  return lessons[currentIndex + 1];
};

const getContinueLesson = (course, progress) => {
  if (progress?.lastAccessedLesson) {
    const found = findLessonInCourse(course, progress.lastAccessedLesson);

    if (found) {
      return {
        lessonId: found.lesson._id.toString(),
        sectionId: found.section._id.toString(),
        sectionTitle: found.section.title,
        lessonTitle: found.lesson.title,
      };
    }
  }

  const lessons = getAllLessons(course);

  return lessons[0] || null;
};

const getLessonProgressItem = (progress, lessonId) => {
  return progress.lessonProgress.find((item) => item.lessonId === lessonId);
};

const syncCompletedLessons = (progress) => {
  progress.completedLessons = progress.lessonProgress
    .filter((item) => item.completed)
    .map((item) => item.lessonId);
};

const getDateOnly = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const updateLearningStreak = async (userId) => {
  const user = await User.findById(userId);

  if (!user) return null;

  const today = getDateOnly(new Date());
  const lastActivityDate = user.learningStreak?.lastActivityDate
    ? getDateOnly(new Date(user.learningStreak.lastActivityDate))
    : null;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let currentStreak = user.learningStreak?.currentStreak || 0;

  if (!lastActivityDate) {
    currentStreak = 1;
  } else if (lastActivityDate.getTime() === today.getTime()) {
    currentStreak = currentStreak || 1;
  } else if (lastActivityDate.getTime() === yesterday.getTime()) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  const longestStreak = Math.max(
    user.learningStreak?.longestStreak || 0,
    currentStreak,
  );

  user.learningStreak = {
    currentStreak,
    longestStreak,
    lastActivityDate: today,
  };

  await user.save();

  return user.learningStreak;
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

    if (!isStudentEnrolled(course, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Please enroll in this course to track progress",
      });
    }

    const found = findLessonInCourse(course, lessonId);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
      });
    }

    let lessonProgress = getLessonProgressItem(progress, lessonId);

    if (!lessonProgress) {
      progress.lessonProgress.push({
        lessonId,
        watchedSeconds: 0,
        durationSeconds: Number(found.lesson.duration || 0) * 60,
        completed: true,
        completedAt: new Date(),
        lastWatchedAt: new Date(),
      });
    } else {
      lessonProgress.completed = true;
      lessonProgress.completedAt = lessonProgress.completedAt || new Date();
      lessonProgress.lastWatchedAt = new Date();
    }

    progress.lastAccessedLesson = lessonId;
    progress.lastAccessedSection = found.section._id.toString();
    progress.lastAccessedAt = new Date();

    syncCompletedLessons(progress);

    await progress.save();

    const learningStreak = await updateLearningStreak(req.user._id);

    await createActivity({
      user: req.user._id,
      role: "student",
      type: "lesson_completed",
      title: "Lesson Completed",
      message: `Completed lesson: ${found.lesson.title}`,
      course: course._id,
      metadata: {
        lessonId,
        lessonTitle: found.lesson.title,
        sectionTitle: found.section.title,
      },
    });

    const currentSummary = calculateProgressSummary(course, progress);

    if (currentSummary.percentage === 100) {
      await createActivity({
        user: req.user._id,
        role: "student",
        type: "course_completed",
        title: "Course Completed",
        message: `Completed course: ${course.title}`,
        course: course._id,
      });
    }

    const summary = calculateProgressSummary(course, progress);

    return res.status(200).json({
      success: true,
      message: "Lesson marked as complete",
      progress,
      learningStreak,
      nextLesson: getNextLesson(course, lessonId),
      continueLesson: getContinueLesson(course, progress),
      ...summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const updateLessonWatchProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const { lessonId, watchedSeconds = 0, durationSeconds = 0 } = req.body;

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

    if (!isStudentEnrolled(course, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Please enroll in this course to track progress",
      });
    }

    const found = findLessonInCourse(course, lessonId);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
      });
    }

    const safeWatchedSeconds = Math.max(Number(watchedSeconds) || 0, 0);
    const safeDurationSeconds = Math.max(
      Number(durationSeconds) || Number(found.lesson.duration || 0) * 60 || 0,
      0,
    );

    const shouldAutoComplete =
      safeDurationSeconds > 0 &&
      safeWatchedSeconds / safeDurationSeconds >= 0.9;

    let lessonProgress = getLessonProgressItem(progress, lessonId);

    if (!lessonProgress) {
      progress.lessonProgress.push({
        lessonId,
        watchedSeconds: safeWatchedSeconds,
        durationSeconds: safeDurationSeconds,
        completed: shouldAutoComplete,
        completedAt: shouldAutoComplete ? new Date() : null,
        lastWatchedAt: new Date(),
      });
    } else {
      lessonProgress.watchedSeconds = Math.max(
        lessonProgress.watchedSeconds || 0,
        safeWatchedSeconds,
      );

      lessonProgress.durationSeconds =
        safeDurationSeconds || lessonProgress.durationSeconds || 0;

      if (shouldAutoComplete && !lessonProgress.completed) {
        lessonProgress.completed = true;
        lessonProgress.completedAt = new Date();
      }

      lessonProgress.lastWatchedAt = new Date();
    }

    progress.lastAccessedLesson = lessonId;
    progress.lastAccessedSection = found.section._id.toString();
    progress.lastAccessedAt = new Date();

    syncCompletedLessons(progress);

    await progress.save();

    const learningStreak = shouldAutoComplete
      ? await updateLearningStreak(req.user._id)
      : null;

    const summary = calculateProgressSummary(course, progress);

    return res.status(200).json({
      success: true,
      message: shouldAutoComplete
        ? "Lesson auto-marked as complete"
        : "Watch progress updated",
      progress,
      learningStreak,
      lessonProgress: getLessonProgressItem(progress, lessonId),
      nextLesson: getNextLesson(course, lessonId),
      continueLesson: getContinueLesson(course, progress),
      ...summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update watch progress",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
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

    if (!isStudentEnrolled(course, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Please enroll in this course to view progress",
      });
    }

    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    const fallbackProgress = {
      completedLessons: [],
      lessonProgress: [],
      lastAccessedLesson: "",
      lastAccessedSection: "",
      lastAccessedAt: null,
    };

    const activeProgress = progress || fallbackProgress;

    const summary = calculateProgressSummary(course, activeProgress);

    return res.status(200).json({
      success: true,
      progress: activeProgress,
      continueLesson: getContinueLesson(course, activeProgress),
      ...summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
