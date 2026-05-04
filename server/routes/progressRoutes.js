import express from "express";
import {
  markLessonComplete,
  getProgress,
} from "../controllers/progressController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:courseId/complete",
  protect,
  authorizeRoles("student"),
  markLessonComplete
);

router.get(
  "/:courseId",
  protect,
  authorizeRoles("student"),
  getProgress
);

export default router;