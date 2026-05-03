import express from "express";
import {
  createCourse,
  enrollCourse,
  getAllCourses,
  getCourseById,
  getInstructorCourses,
  getInstructorAnalytics,
} from "../controllers/courseController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("instructor", "admin"), createCourse);

// ✅ important: keep these ABOVE :id
router.get("/instructor/courses", protect, authorizeRoles("instructor"), getInstructorCourses);
router.get("/instructor/analytics", protect, authorizeRoles("instructor"), getInstructorAnalytics);

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/:id/enroll", protect, authorizeRoles("student"), enrollCourse);

export default router;