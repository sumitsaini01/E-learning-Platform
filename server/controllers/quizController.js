import mongoose from "mongoose";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { createActivity, createNotification } from "../utils/activityHelper.js";

const sendServerError = (res, message, error) => {
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
};

const validateCourseOwnership = (course, user) => {
  if (!course) return { status: 404, message: "Course not found" };

  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    return { status: 403, message: "Not authorized to manage this course" };
  }

  return null;
};

const isStudentEnrolled = (course, userId) => {
  return course.students.some(
    (studentId) => studentId.toString() === userId.toString(),
  );
};

const removeCorrectAnswers = (quiz) => {
  const quizObject = quiz.toObject();

  quizObject.questions = quizObject.questions.map((question) => ({
    _id: question._id,
    questionText: question.questionText,
    options: question.options,
    points: question.points,
  }));

  return quizObject;
};

export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      sectionId,
      lessonId,
      questions = [],
      passingPercentage,
      timeLimitMinutes,
      maxAttempts,
      status,
    } = req.body;

    if (!title?.trim() || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Quiz title and course ID are required",
      });
    }

    const course = await Course.findById(courseId);

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      description: description?.trim() || "",
      course: courseId,
      sectionId: sectionId || "",
      lessonId: lessonId || "",
      questions,
      passingPercentage: passingPercentage ?? 60,
      timeLimitMinutes: timeLimitMinutes ?? 0,
      maxAttempts: maxAttempts ?? 0,
      status: status || "draft",
      instructor: req.user._id,
    });

    await createActivity({
      user: req.user._id,
      role: "instructor",
      type: "course_created",
      title: "Quiz Created",
      message: `Created quiz: ${quiz.title}`,
      course: course._id,
      quiz: quiz._id,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    return sendServerError(res, "Failed to create quiz", error);
  }
};

export const getInstructorQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      instructor: req.user._id,
    })
      .populate("course", "title category level students")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("Get instructor quizzes error:", error);

    return sendServerError(res, "Failed to fetch quizzes", error);
  }
};

export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isInstructorOwner =
      req.user?.role === "admin" ||
      course.instructor.toString() === req.user?._id?.toString();

    const isAllowedStudent =
      req.user?.role === "student" && isStudentEnrolled(course, req.user._id);

    if (!isInstructorOwner && !isAllowedStudent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view quizzes for this course",
      });
    }

    const filter = {
      course: courseId,
    };

    if (req.user.role === "student") {
      filter.status = "published";
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes:
        req.user.role === "student"
          ? quizzes.map((quiz) => removeCorrectAnswers(quiz))
          : quizzes,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch course quizzes", error);
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz id",
      });
    }

    const quiz = await Quiz.findById(quizId).populate("course");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const course = quiz.course;

    const isInstructorOwner =
      req.user.role === "admin" ||
      course.instructor.toString() === req.user._id.toString();

    const isAllowedStudent =
      req.user.role === "student" && isStudentEnrolled(course, req.user._id);

    if (!isInstructorOwner && !isAllowedStudent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this quiz",
      });
    }

    return res.status(200).json({
      success: true,
      quiz: req.user.role === "student" ? removeCorrectAnswers(quiz) : quiz,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch quiz", error);
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const course = await Course.findById(quiz.course);

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const allowedFields = [
      "title",
      "description",
      "sectionId",
      "lessonId",
      "questions",
      "passingPercentage",
      "timeLimitMinutes",
      "maxAttempts",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        quiz[field] = req.body[field];
      }
    });

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update quiz", error);
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const course = await Course.findById(quiz.course);

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    await QuizAttempt.deleteMany({ quiz: quizId });
    await quiz.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, "Failed to delete quiz", error);
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers = [] } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz || quiz.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Published quiz not found",
      });
    }

    const course = await Course.findById(quiz.course);

    if (!course || !isStudentEnrolled(course, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only enrolled students can attempt this quiz",
      });
    }

    const previousAttempts = await QuizAttempt.countDocuments({
      quiz: quizId,
      user: req.user._id,
    });

    if (quiz.maxAttempts > 0 && previousAttempts >= quiz.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: "Maximum quiz attempts reached",
      });
    }

    let score = 0;

    const totalPoints = quiz.questions.reduce(
      (total, question) => total + Number(question.points || 1),
      0,
    );

    const evaluatedAnswers = quiz.questions.map((question) => {
      const submittedAnswer = answers.find(
        (answer) => answer.questionId === question._id.toString(),
      );

      const selectedOptionIndex = Number(submittedAnswer?.selectedOptionIndex);

      const safeSelectedOptionIndex = Number.isNaN(selectedOptionIndex)
        ? -1
        : selectedOptionIndex;

      const isCorrect =
        safeSelectedOptionIndex === Number(question.correctOptionIndex);

      const pointsEarned = isCorrect ? Number(question.points || 1) : 0;

      score += pointsEarned;

      return {
        questionId: question._id.toString(),
        selectedOptionIndex: safeSelectedOptionIndex,
        isCorrect,
        pointsEarned,
      };
    });

    const percentage =
      totalPoints === 0 ? 0 : Math.round((score / totalPoints) * 100);

    const passed = percentage >= quiz.passingPercentage;

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      course: quiz.course,
      user: req.user._id,
      answers: evaluatedAnswers,
      score,
      totalPoints,
      percentage,
      passed,
      attemptNumber: previousAttempts + 1,
      submittedAt: new Date(),
    });

    await createActivity({
      user: req.user._id,
      role: "student",
      type: passed ? "quiz_passed" : "quiz_attempted",
      title: passed ? "Quiz Passed" : "Quiz Attempted",
      message: `${passed ? "Passed" : "Attempted"} quiz: ${quiz.title}`,
      course: course._id,
      quiz: quiz._id,
    });

    await createNotification({
      recipient: course.instructor,
      type: "quiz_attempted",
      title: "Quiz Attempted",
      message: `${req.user.name} attempted quiz ${quiz.title}`,
      course: course._id,
      quiz: quiz._id,
    });

    const review = quiz.questions.map((question) => {
      const answer = evaluatedAnswers.find(
        (item) => item.questionId === question._id.toString(),
      );

      return {
        questionId: question._id.toString(),
        questionText: question.questionText,
        options: question.options,
        selectedOptionIndex: answer?.selectedOptionIndex ?? -1,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect: answer?.isCorrect || false,
        pointsEarned: answer?.pointsEarned || 0,
        points: question.points || 1,
        explanation: question.explanation || "",
      };
    });

    return res.status(201).json({
      success: true,
      message: passed ? "Quiz passed successfully" : "Quiz submitted",
      attempt,
      result: {
        score,
        totalPoints,
        percentage,
        passed,
        passingPercentage: quiz.passingPercentage,
        attemptNumber: previousAttempts + 1,
      },
      review,
    });
  } catch (error) {
    return sendServerError(res, "Failed to submit quiz", error);
  }
};

export const getMyQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user._id,
    })
      .populate("quiz", "title passingPercentage")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch quiz attempts", error);
  }
};
