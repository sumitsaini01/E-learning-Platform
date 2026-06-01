import express from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  getMyNotifications,
);

router.patch(
  "/:notificationId/read",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  markNotificationAsRead,
);

router.patch(
  "/mark-all-read",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  markAllNotificationsAsRead,
);

router.delete(
  "/:notificationId",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  deleteNotification,
);

export default router;