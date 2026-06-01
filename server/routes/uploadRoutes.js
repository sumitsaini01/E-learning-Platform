import express from "express";
import {
  uploadCourseThumbnail,
  uploadLessonVideo,
} from "../controllers/uploadController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

const router = express.Router();

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