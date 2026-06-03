import express from "express";
import rateLimit from "express-rate-limit";
import {
  addLesson,
  addSection,
  createCourse,
  createCourseReview,
  generateCourseDescription,
  generateStudyNotes,
  generateFlashcards,
  deleteCourse,
  deleteCourseReview,
  deleteLesson,
  deleteSection,
  enrollCourse,
  getCourses,
  getCourseById,
  getInstructorAnalytics,
  getInstructorCourses,
  getStudentEnrolledCourses,
  getSavedCourses,
  getRecommendedCourses,
  getAiStudyResources,
  saveCourse,
  removeSavedCourse,
  moveLesson,
  publishCourse,
  unpublishCourse,
  updateCourse,
  updateCourseReview,
  updateLesson,
  updateSection,
} from "../controllers/courseController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
  },
});

router.post(
  "/generate-description",
  aiLimiter,
  protect,
  authorizeRoles("instructor", "admin"),
  generateCourseDescription,
);

router.post("/", protect, authorizeRoles("instructor", "admin"), createCourse);

router.get(
  "/instructor/courses",
  protect,
  authorizeRoles("instructor", "admin"),
  getInstructorCourses,
);

router.get(
  "/instructor/analytics",
  protect,
  authorizeRoles("instructor", "admin"),
  getInstructorAnalytics,
);

router.get(
  "/student/enrolled",
  protect,
  authorizeRoles("student"),
  getStudentEnrolledCourses,
);

router.get(
  "/student/saved",
  protect,
  authorizeRoles("student"),
  getSavedCourses,
);

router.get(
  "/student/recommended",
  protect,
  authorizeRoles("student"),
  getRecommendedCourses,
);

router.post("/:id/save", protect, authorizeRoles("student"), saveCourse);

router.delete(
  "/:id/save",
  protect,
  authorizeRoles("student"),
  removeSavedCourse,
);

router.post(
  "/:id/generate-study-notes",
  aiLimiter,
  protect,
  authorizeRoles("student", "instructor", "admin"),
  generateStudyNotes,
);

router.post(
  "/:id/generate-flashcards",
  aiLimiter,
  protect,
  authorizeRoles("student", "instructor", "admin"),
  generateFlashcards,
);

router.get(
  "/:id/ai-study-resources",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  getAiStudyResources,
);

router.post(
  "/:id/reviews",
  protect,
  authorizeRoles("student"),
  createCourseReview,
);

router.put(
  "/:id/reviews/:reviewId",
  protect,
  authorizeRoles("student"),
  updateCourseReview,
);

router.delete(
  "/:id/reviews/:reviewId",
  protect,
  authorizeRoles("student"),
  deleteCourseReview,
);

router.post(
  "/:id/sections",
  protect,
  authorizeRoles("instructor", "admin"),
  addSection,
);

router.post(
  "/:id/sections/:sectionId/lessons",
  protect,
  authorizeRoles("instructor", "admin"),
  addLesson,
);

router.delete(
  "/:id/sections/:sectionId",
  protect,
  authorizeRoles("instructor", "admin"),
  deleteSection,
);

router.put(
  "/:id/sections/:sectionId",
  protect,
  authorizeRoles("instructor", "admin"),
  updateSection,
);

router.put(
  "/:id/sections/:sectionId/lessons/:lessonId",
  protect,
  authorizeRoles("instructor", "admin"),
  updateLesson,
);

router.patch(
  "/:id/sections/:sectionId/lessons/:lessonId/move",
  protect,
  authorizeRoles("instructor", "admin"),
  moveLesson,
);

router.delete(
  "/:id/sections/:sectionId/lessons/:lessonId",
  protect,
  authorizeRoles("instructor", "admin"),
  deleteLesson,
);

router.put(
  "/:id",
  protect,
  authorizeRoles("instructor", "admin"),
  updateCourse,
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("instructor", "admin"),
  deleteCourse,
);

router.patch(
  "/:id/publish",
  protect,
  authorizeRoles("instructor", "admin"),
  publishCourse,
);

router.patch(
  "/:id/unpublish",
  protect,
  authorizeRoles("instructor", "admin"),
  unpublishCourse,
);

router.get("/", getCourses);

router.get("/:id", getCourseById);

router.post("/:id/enroll", protect, authorizeRoles("student"), enrollCourse);

export default router;
