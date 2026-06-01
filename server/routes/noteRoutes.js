import express from "express";

import {
  deleteLessonNote,
  getCourseNotes,
  getLessonNote,
  saveLessonNote,
} from "../controllers/noteController.js";

import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/course/:courseId",
  protect,
  authorizeRoles("student"),
  getCourseNotes,
);

router.get(
  "/course/:courseId/lesson/:lessonId",
  protect,
  authorizeRoles("student"),
  getLessonNote,
);

router.put(
  "/course/:courseId/lesson/:lessonId",
  protect,
  authorizeRoles("student"),
  saveLessonNote,
);

router.delete(
  "/course/:courseId/lesson/:lessonId",
  protect,
  authorizeRoles("student"),
  deleteLessonNote,
);

export default router;