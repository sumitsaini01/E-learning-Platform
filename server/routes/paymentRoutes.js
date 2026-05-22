import express from "express";

import {
  createOrder,
  verifyPayment,
  getMyPurchasedCourses,
} from "../controllers/paymentController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Student Payments
|--------------------------------------------------------------------------
*/

router.post(
  "/create-order",
  protect,
  authorizeRoles("student"),
  createOrder,
);

router.post(
  "/verify",
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