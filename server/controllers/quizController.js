import mongoose from "mongoose";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { createActivity, createNotification } from "../utils/activityHelper.js";
import { generateQuizQuestionsWithAI } from "../services/aiQuizService.js";

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

export const generateAIQuiz = async (req, res) => {
  try {
    const {
      courseId,
      topic,
      difficulty = "intermediate",
      questionCount = 5,
    } = req.body;

    if (!courseId || !topic?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course ID and topic are required",
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

    const questions = await generateQuizQuestionsWithAI({
      topic,
      difficulty,
      questionCount,
      courseTitle: course.title,
      courseDescription: course.description,
    });

    return res.status(200).json({
      success: true,
      message: "AI quiz generated successfully",
      questions,
    });
  } catch (error) {
    console.error("AI quiz generation error:", error.message);

    return sendServerError(res, "Failed to generate AI quiz", error);
  }
};

const validateQuestions = (questions = []) => {
  for (const [index, question] of questions.entries()) {
    if (!question.questionText?.trim()) {
      return `Question ${index + 1}: question text is required`;
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      return `Question ${index + 1}: at least two options are required`;
    }

    const correctOptionIndex = Number(question.correctOptionIndex);

    if (
      Number.isNaN(correctOptionIndex) ||
      correctOptionIndex < 0 ||
      correctOptionIndex >= question.options.length
    ) {
      return `Question ${index + 1}: correct option index is invalid`;
    }
  }

  return null;
};

const shuffleOptionsAndCorrectIndex = (question) => {
  const correctAnswer = question.options[Number(question.correctOptionIndex)];

  const shuffledOptions = [...question.options]
    .map((option) => ({
      value: option,
      sort: Math.random(),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);

  return {
    ...question,
    options: shuffledOptions,
    correctOptionIndex: shuffledOptions.findIndex(
      (option) => option === correctAnswer,
    ),
  };
};

const shuffleQuestionOrder = (questions = []) => {
  return [...questions]
    .map((question) => ({
      questionId: question._id.toString(),
      sort: Math.random(),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map((item, index) => ({
      questionId: item.questionId,
      order: index + 1,
    }));
};

const prepareQuestionsForSave = (questions = []) => {
  return questions.map((question) =>
    shuffleOptionsAndCorrectIndex({
      ...question,
      questionText: question.questionText.trim(),
      options: question.options.map((option) => option.trim()),
      correctOptionIndex: Number(question.correctOptionIndex),
      explanation: question.explanation?.trim() || "",
      points: Number(question.points) || 1,
    }),
  );
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
      source,
      aiPrompt,
    } = req.body;

    if (!title?.trim() || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Quiz title and course ID are required",
      });
    }

    const questionError = validateQuestions(questions);

    if (questionError) {
      return res.status(400).json({
        success: false,
        message: questionError,
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
      questions: prepareQuestionsForSave(questions),
      passingPercentage: passingPercentage ?? 60,
      timeLimitMinutes: timeLimitMinutes ?? 0,
      maxAttempts: maxAttempts ?? 0,
      status: status || "draft",
      source: source || "manual",
      aiPrompt: aiPrompt?.trim() || "",
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
    const filter =
      req.user.role === "admin"
        ? {}
        : {
            instructor: req.user._id,
          };

    const quizzes = await Quiz.find(filter)
      .populate("course", "title category level students instructor")
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);

    return sendServerError(res, "Failed to fetch quizzes", error);
  }
};

export const getQuizAnalytics = async (req, res) => {
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

    const ownershipError = validateCourseOwnership(quiz.course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const attempts = await QuizAttempt.find({
      quiz: quizId,
      status: "submitted",
    })
      .populate("user", "name email")
      .sort({ submittedAt: -1 });

    const totalAttempts = attempts.length;
    const passed = attempts.filter((attempt) => attempt.passed).length;
    const failed = totalAttempts - passed;

    const averageScore =
      totalAttempts === 0
        ? 0
        : Math.round(
            attempts.reduce(
              (sum, attempt) => sum + Number(attempt.percentage || 0),
              0,
            ) / totalAttempts,
          );

    const missedMap = {};

    quiz.questions.forEach((question) => {
      missedMap[question._id.toString()] = {
        questionId: question._id.toString(),
        questionText: question.questionText,
        missedCount: 0,
      };
    });

    attempts.forEach((attempt) => {
      attempt.answers.forEach((answer) => {
        if (!answer.isCorrect && missedMap[answer.questionId]) {
          missedMap[answer.questionId].missedCount += 1;
        }
      });
    });

    const missedQuestions = Object.values(missedMap).sort(
      (a, b) => b.missedCount - a.missedCount,
    );

    const mostMissedQuestion =
      missedQuestions.length > 0 && missedQuestions[0].missedCount > 0
        ? missedQuestions[0]
        : null;

    return res.status(200).json({
      success: true,
      analytics: {
        quizId: quiz._id,
        quizTitle: quiz.title,
        courseTitle: quiz.course?.title || "",
        totalAttempts,
        passed,
        failed,
        averageScore,
        passRate:
          totalAttempts === 0 ? 0 : Math.round((passed / totalAttempts) * 100),
        mostMissedQuestion,
        missedQuestions,
        recentAttempts: attempts.slice(0, 10).map((attempt) => ({
          attemptId: attempt._id,
          student: attempt.user,
          score: attempt.score,
          totalPoints: attempt.totalPoints,
          percentage: attempt.percentage,
          passed: attempt.passed,
          submittedAt: attempt.submittedAt,
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch quiz analytics", error);
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

    if (req.user.role === "student") {
      const activeAttempt = await QuizAttempt.findOne({
        quiz: quizId,
        user: req.user._id,
        status: "in_progress",
      });

      let safeQuiz = removeCorrectAnswers(quiz);

      if (activeAttempt?.questionOrder?.length) {
        const orderMap = new Map(
          activeAttempt.questionOrder.map((item) => [
            item.questionId,
            item.order,
          ]),
        );

        safeQuiz.questions = safeQuiz.questions
          .filter((question) => orderMap.has(question._id.toString()))
          .sort(
            (a, b) =>
              orderMap.get(a._id.toString()) - orderMap.get(b._id.toString()),
          );
      }

      return res.status(200).json({
        success: true,
        quiz: safeQuiz,
      });
    }

    return res.status(200).json({
      success: true,
      quiz,
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

    if (req.body.questions !== undefined) {
      const questionError = validateQuestions(req.body.questions);

      if (questionError) {
        return res.status(400).json({
          success: false,
          message: questionError,
        });
      }
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
      "source",
      "aiPrompt",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "questions") {
          quiz.questions = prepareQuestionsForSave(req.body.questions);
        } else {
          quiz[field] = req.body[field];
        }
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

export const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;

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
      status: { $ne: "in_progress" },
    });

    if (quiz.maxAttempts > 0 && previousAttempts >= quiz.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: "Maximum quiz attempts reached",
      });
    }

    let activeAttempt = await QuizAttempt.findOne({
      quiz: quizId,
      user: req.user._id,
      status: "in_progress",
    });

    if (activeAttempt) {
      return res.status(200).json({
        success: true,
        message: "Existing quiz attempt resumed",
        attempt: activeAttempt,
      });
    }

    const now = new Date();

    const expiresAt =
      quiz.timeLimitMinutes > 0
        ? new Date(now.getTime() + quiz.timeLimitMinutes * 60 * 1000)
        : null;

    const questionOrder = shuffleQuestionOrder(quiz.questions);

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      course: quiz.course,
      user: req.user._id,
      attemptNumber: previousAttempts + 1,
      questionOrder,
      startedAt: now,
      expiresAt,
      status: "in_progress",
    });

    return res.status(201).json({
      success: true,
      message: "Quiz attempt started",
      attempt,
    });
  } catch (error) {
    return sendServerError(res, "Failed to start quiz attempt", error);
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers = [], attemptId } = req.body;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

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

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quiz: quizId,
      user: req.user._id,
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active quiz attempt not found",
      });
    }

    const now = new Date();

    if (attempt.expiresAt && now > attempt.expiresAt) {
      attempt.status = "expired";
      attempt.submittedAt = now;
      await attempt.save();

      return res.status(403).json({
        success: false,
        message: "Quiz time expired",
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

    attempt.answers = evaluatedAnswers;
    attempt.score = score;
    attempt.totalPoints = totalPoints;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();

    await attempt.save();

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
      actionUrl: "/instructor/quizzes",
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
        attemptNumber: attempt.attemptNumber,
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
