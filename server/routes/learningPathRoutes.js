import express from "express";

import {
  generateLearningPath,
  getMyLearningPaths,
  deleteLearningPath,
} from "../controllers/learningPathController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/generate",
  protect,
  authorizeRoles("student"),
  generateLearningPath,
);

router.get("/my", protect, authorizeRoles("student"), getMyLearningPaths);

router.delete(
  "/:pathId",
  protect,
  authorizeRoles("student"),
  deleteLearningPath,
);

export default router;
