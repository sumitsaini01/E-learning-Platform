import express from "express";
import rateLimit from "express-rate-limit";

import {
  deleteInterviewPrep,
  generateInterviewPrep,
  getInterviewPrepById,
  getMyInterviewPreps,
} from "../controllers/interviewPrepController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const interviewPrepLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many interview prep requests. Please try again later.",
  },
});

router.post(
  "/generate",
  interviewPrepLimiter,
  protect,
  authorizeRoles("student"),
  generateInterviewPrep,
);

router.get("/my", protect, authorizeRoles("student"), getMyInterviewPreps);

router.get(
  "/:prepId",
  protect,
  authorizeRoles("student"),
  getInterviewPrepById,
);

router.delete(
  "/:prepId",
  protect,
  authorizeRoles("student"),
  deleteInterviewPrep,
);

export default router;
