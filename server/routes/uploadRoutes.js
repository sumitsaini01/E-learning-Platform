import express from "express";
import {
  uploadAvatar,
  uploadCourseThumbnail,
  uploadLessonVideo,
} from "../controllers/uploadController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/avatar",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  uploadSingle,
  uploadAvatar,
);

router.post(
  "/thumbnail",
  protect,
  authorizeRoles("instructor", "admin"),
  uploadSingle,
  uploadCourseThumbnail,
);

router.post(
  "/video",
  protect,
  authorizeRoles("instructor", "admin"),
  uploadSingle,
  uploadLessonVideo,
);

export default router;
