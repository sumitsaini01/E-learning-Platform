import express from "express";
import rateLimit from "express-rate-limit";

import {
  createOrder,
  verifyPayment,
  getMyPurchasedCourses,
} from "../controllers/paymentController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment requests. Please try again later.",
  },
});

router.post(
  "/create-order",
  paymentLimiter,
  protect,
  authorizeRoles("student"),
  createOrder,
);

router.post(
  "/verify",
  paymentLimiter,
  protect,
  authorizeRoles("student"),
  verifyPayment,
);

router.get(
  "/my-purchases",
  protect,
  authorizeRoles("student"),
  getMyPurchasedCourses,
);

export default router;
