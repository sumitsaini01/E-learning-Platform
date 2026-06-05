import express from "express";

import {
  deleteJobReadiness,
  generateJobReadiness,
  getJobReadinessById,
  getMyJobReadinessReports,
} from "../controllers/jobReadinessController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/generate",
  protect,
  authorizeRoles("student"),
  generateJobReadiness,
);

router.get("/my", protect, authorizeRoles("student"), getMyJobReadinessReports);

router.get(
  "/:reportId",
  protect,
  authorizeRoles("student"),
  getJobReadinessById,
);

router.delete(
  "/:reportId",
  protect,
  authorizeRoles("student"),
  deleteJobReadiness,
);

export default router;
