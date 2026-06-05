import express from "express";

import {
  createQuiz,
  deleteQuiz,
  generateAIQuiz,
  getCourseQuizzes,
  getInstructorQuizzes,
  getMyQuizAttempts,
  getQuizAnalytics,
  getQuizById,
  startQuizAttempt,
  submitQuizAttempt,
  updateQuiz,
} from "../controllers/quizController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Instructor Quiz Management
|--------------------------------------------------------------------------
*/

router.post("/", protect, authorizeRoles("instructor", "admin"), createQuiz);

router.post(
  "/generate-ai",
  protect,
  authorizeRoles("instructor", "admin"),
  generateAIQuiz,
);

router.get(
  "/instructor",
  protect,
  authorizeRoles("instructor", "admin"),
  getInstructorQuizzes,
);

router.get(
  "/:quizId/analytics",
  protect,
  authorizeRoles("instructor", "admin"),
  getQuizAnalytics,
);

/*
|--------------------------------------------------------------------------
| Student Quiz Lists
|--------------------------------------------------------------------------
*/

router.get(
  "/course/:courseId",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  getCourseQuizzes,
);

router.get(
  "/attempts/my",
  protect,
  authorizeRoles("student"),
  getMyQuizAttempts,
);

/*
|--------------------------------------------------------------------------
| Quiz Attempt Flow
|--------------------------------------------------------------------------
*/

router.post(
  "/:quizId/start",
  protect,
  authorizeRoles("student"),
  startQuizAttempt,
);

router.post(
  "/:quizId/attempt",
  protect,
  authorizeRoles("student"),
  submitQuizAttempt,
);

/*
|--------------------------------------------------------------------------
| Single Quiz Operations
|--------------------------------------------------------------------------
*/

router.get(
  "/:quizId",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  getQuizById,
);

router.put(
  "/:quizId",
  protect,
  authorizeRoles("instructor", "admin"),
  updateQuiz,
);

router.delete(
  "/:quizId",
  protect,
  authorizeRoles("instructor", "admin"),
  deleteQuiz,
);

export default router;
