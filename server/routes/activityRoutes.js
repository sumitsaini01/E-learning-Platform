import express from "express";
import {
  getMyActivities,
  getActivitySummary,
} from "../controllers/activityController.js";
import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  getMyActivities,
);

router.get(
  "/summary",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  getActivitySummary,
);

export default router;