import express from "express";

import {
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
} from "../controllers/certificateController.js";

import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  authorizeRoles("student"),
  getMyCertificates,
);

router.post(
  "/courses/:courseId/generate",
  protect,
  authorizeRoles("student"),
  generateCertificate,
);

router.get(
  "/verify/:certificateId",
  verifyCertificate,
);

export default router;