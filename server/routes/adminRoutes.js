import express from "express";

import {
  getAdminCourses,
  getAdminDashboard,
  getAdminUsers,
  updateUserRole,
} from "../controllers/adminController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getAdminDashboard,
);

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAdminUsers,
);

router.patch(
  "/users/:userId/role",
  protect,
  authorizeRoles("admin"),
  updateUserRole,
);

router.get(
  "/courses",
  protect,
  authorizeRoles("admin"),
  getAdminCourses,
);

export default router;