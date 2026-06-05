import express from "express";

import {
  deleteStudyPlan,
  generateStudyPlan,
  getMyStudyPlans,
  getStudyPlanById,
} from "../controllers/studyPlannerController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, authorizeRoles("student"), generateStudyPlan);

router.get("/my", protect, authorizeRoles("student"), getMyStudyPlans);

router.get("/:planId", protect, authorizeRoles("student"), getStudyPlanById);

router.delete("/:planId", protect, authorizeRoles("student"), deleteStudyPlan);

export default router;
