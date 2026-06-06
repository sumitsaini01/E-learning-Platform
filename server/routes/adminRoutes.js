import express from "express";

import {
  deleteAdminCourse,
  deleteAdminUser,
  getAdminCertificateAnalytics,
  getAdminCourseAnalytics,
  getAdminCourses,
  getAdminDashboard,
  getAdminEnrollmentAnalytics,
  getAdminPlatformMonitoring,
  getAdminQuizAnalytics,
  getAdminRevenueAnalytics,
  getAdminUserAnalytics,
  getAdminUsers,
  updateAdminCourseStatus,
  updateUserRole,
  updateUserVerificationStatus,
} from "../controllers/adminController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), getAdminDashboard);

router.get(
  "/analytics/users",
  protect,
  authorizeRoles("admin"),
  getAdminUserAnalytics,
);

router.get(
  "/analytics/courses",
  protect,
  authorizeRoles("admin"),
  getAdminCourseAnalytics,
);

router.get(
  "/analytics/revenue",
  protect,
  authorizeRoles("admin"),
  getAdminRevenueAnalytics,
);

router.get(
  "/analytics/enrollments",
  protect,
  authorizeRoles("admin"),
  getAdminEnrollmentAnalytics,
);

router.get(
  "/analytics/quizzes",
  protect,
  authorizeRoles("admin"),
  getAdminQuizAnalytics,
);

router.get(
  "/analytics/certificates",
  protect,
  authorizeRoles("admin"),
  getAdminCertificateAnalytics,
);

router.get(
  "/monitoring",
  protect,
  authorizeRoles("admin"),
  getAdminPlatformMonitoring,
);

router.get("/users", protect, authorizeRoles("admin"), getAdminUsers);

router.patch(
  "/users/:userId/role",
  protect,
  authorizeRoles("admin"),
  updateUserRole,
);

router.patch(
  "/users/:userId/verification",
  protect,
  authorizeRoles("admin"),
  updateUserVerificationStatus,
);

router.delete(
  "/users/:userId",
  protect,
  authorizeRoles("admin"),
  deleteAdminUser,
);

router.get("/courses", protect, authorizeRoles("admin"), getAdminCourses);

router.patch(
  "/courses/:courseId/status",
  protect,
  authorizeRoles("admin"),
  updateAdminCourseStatus,
);

router.delete(
  "/courses/:courseId",
  protect,
  authorizeRoles("admin"),
  deleteAdminCourse,
);

export default router;
