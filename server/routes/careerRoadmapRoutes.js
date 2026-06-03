import express from "express";

import {
  generateCareerRoadmap,
  getMyCareerRoadmaps,
  getCareerRoadmapById,
  deleteCareerRoadmap,
} from "../controllers/careerRoadmapController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/generate",
  protect,
  authorizeRoles("student"),
  generateCareerRoadmap,
);

router.get("/my", protect, authorizeRoles("student"), getMyCareerRoadmaps);

router.get(
  "/:roadmapId",
  protect,
  authorizeRoles("student"),
  getCareerRoadmapById,
);

router.delete(
  "/:roadmapId",
  protect,
  authorizeRoles("student"),
  deleteCareerRoadmap,
);

export default router;
