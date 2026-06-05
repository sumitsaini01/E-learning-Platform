import express from "express";
import rateLimit from "express-rate-limit";

import {
  deleteMockInterview,
  getMockInterviewById,
  getMyMockInterviews,
  startMockInterview,
  submitMockInterviewAnswer,
} from "../controllers/mockInterviewController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const mockInterviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many mock interview requests. Please try again later.",
  },
});

router.post(
  "/start",
  mockInterviewLimiter,
  protect,
  authorizeRoles("student"),
  startMockInterview,
);

router.put(
  "/:interviewId/questions/:questionId/answer",
  protect,
  authorizeRoles("student"),
  submitMockInterviewAnswer,
);

router.get("/my", protect, authorizeRoles("student"), getMyMockInterviews);

router.get(
  "/:interviewId",
  protect,
  authorizeRoles("student"),
  getMockInterviewById,
);

router.delete(
  "/:interviewId",
  protect,
  authorizeRoles("student"),
  deleteMockInterview,
);

export default router;
