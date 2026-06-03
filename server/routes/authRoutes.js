import express from "express";
import {
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  getLearningActivity,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/resend-email-otp", resendEmailOtp);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getUserProfile);
router.get("/learning-activity", protect, getLearningActivity);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

export default router;
