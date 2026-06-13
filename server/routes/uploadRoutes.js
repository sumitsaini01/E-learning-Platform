import express from "express";
import rateLimit from "express-rate-limit";
import {
  uploadAvatar,
  uploadCourseThumbnail,
  uploadLessonVideo,
} from "../controllers/uploadController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many upload requests. Please try again later.",
  },
});

const router = express.Router();

router.post(
  "/avatar",
  uploadLimiter,
  protect,
  authorizeRoles("student", "instructor", "admin"),
  uploadSingle,
  uploadAvatar,
);

router.post(
  "/thumbnail",
  uploadLimiter,
  protect,
  authorizeRoles("instructor", "admin"),
  uploadSingle,
  uploadCourseThumbnail,
);

router.post(
  "/video",
  uploadLimiter,
  protect,
  authorizeRoles("instructor", "admin"),
  uploadSingle,
  uploadLessonVideo,
);

export default router;
