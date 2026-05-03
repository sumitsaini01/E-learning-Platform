import express from "express";
import {
  createCourse,
  enrollCourse,
  getAllCourses,
  getCourseById,
} from "../controllers/courseController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("instructor", "admin"), createCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/:id/enroll", protect, authorizeRoles("student"), enrollCourse);

export default router;

