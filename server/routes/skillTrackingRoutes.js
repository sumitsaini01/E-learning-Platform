import express from "express";

import {
  getMySkills,
  getSkillProfileSnapshot,
  refreshMySkills,
} from "../controllers/skillTrackingController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, authorizeRoles("student"), getMySkills);

router.get(
  "/snapshot",
  protect,
  authorizeRoles("student"),
  getSkillProfileSnapshot,
);

router.post("/refresh", protect, authorizeRoles("student"), refreshMySkills);

export default router;
