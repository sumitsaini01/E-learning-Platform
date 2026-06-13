import express from "express";
import rateLimit from "express-rate-limit";

import {
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  getLearningActivity,
  getMyDeviceSessions,
  revokeDeviceSession,
  getMyLoginHistory,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  otpValidator,
} from "../validators/authValidators.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth requests. Please try again later.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password requests. Please try again later.",
  },
});

// Public auth routes
router.post(
  "/register",
  authLimiter,
  registerValidator,
  validateRequest,
  registerUser,
);

router.post(
  "/verify-email-otp",
  authLimiter,
  otpValidator,
  validateRequest,
  verifyEmailOtp,
);

router.post(
  "/resend-email-otp",
  authLimiter,
  forgotPasswordValidator,
  validateRequest,
  resendEmailOtp,
);

router.post("/login", loginLimiter, loginValidator, validateRequest, loginUser);

router.post(
  "/forgot-password",
  passwordLimiter,
  forgotPasswordValidator,
  validateRequest,
  forgotPassword,
);

router.put(
  "/reset-password/:token",
  passwordLimiter,
  resetPasswordValidator,
  validateRequest,
  resetPassword,
);

router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);

// Protected user routes
router.get("/profile", protect, getUserProfile);
router.get("/learning-activity", protect, getLearningActivity);

router.put("/profile", protect, updateUserProfile);

router.put(
  "/change-password",
  passwordLimiter,
  protect,
  changePasswordValidator,
  validateRequest,
  changePassword,
);

// Device sessions
router.get("/sessions", protect, getMyDeviceSessions);
router.delete("/sessions/:sessionId", protect, revokeDeviceSession);

// Login history
router.get("/login-history", protect, getMyLoginHistory);

export default router;
