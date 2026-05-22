import express from "express";
import {
  addLesson,
  addSection,
  createCourse,
  createCourseReview,
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