import express from "express";

import {
  getProgress,
  markLessonComplete,
  updateLessonWatchProgress,
} from "../controllers/progressController.js";

import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get Course Progress
|--------------------------------------------------------------------------
*/

router.get(
  "/:courseId",
  protect,
  authorizeRoles("student"),
  getProgress,
);

/*
|--------------------------------------------------------------------------
| Manual Lesson Completion
|--------------------------------------------------------------------------
*/

router.post(
  "/:courseId/complete",
  protect,
  authorizeRoles("student"),
  markLessonComplete,
);

/*
|--------------------------------------------------------------------------
| Watch Progress Tracking
|--------------------------------------------------------------------------
*/

router.post(
  "/:courseId/watch",
  protect,
  authorizeRoles("student"),
  updateLessonWatchProgress,
);

export default router;