import express from "express";
import {
  getProgress,
  markLessonComplete,
} from "../controllers/progressController.js";
import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/:courseId",
  protect,
  authorizeRoles("student"),
  getProgress,
);

router.post(
  "/:courseId/complete",
  protect,
  authorizeRoles("student"),
  markLessonComplete,
);

export default router;