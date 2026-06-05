import express from "express";
import rateLimit from "express-rate-limit";

import {
  analyzeResume,
  deleteResumeAnalysis,
  getMyResumeAnalyses,
} from "../controllers/resumeAnalysisController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/resumeUploadMiddleware.js";

const router = express.Router();

const resumeAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many resume analysis requests. Please try again later.",
  },
});

router.post(
  "/analyze",
  resumeAnalysisLimiter,
  protect,
  authorizeRoles("student"),
  uploadResume,
  analyzeResume,
);

router.get("/my", protect, authorizeRoles("student"), getMyResumeAnalyses);

router.delete(
  "/:analysisId",
  protect,
  authorizeRoles("student"),
  deleteResumeAnalysis,
);

export default router;
