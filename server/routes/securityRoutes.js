import express from "express";
import {
  getAuditLogs,
  getLoginSecurityLogs,
  getSecurityDashboard,
} from "../controllers/securityController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getSecurityDashboard,
);

router.get("/audit-logs", protect, authorizeRoles("admin"), getAuditLogs);

router.get(
  "/login-logs",
  protect,
  authorizeRoles("admin"),
  getLoginSecurityLogs,
);

export default router;
