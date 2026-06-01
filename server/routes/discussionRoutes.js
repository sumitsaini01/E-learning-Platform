import express from "express";

import {
  createDiscussion,
  getCourseDiscussions,
  replyToDiscussion,
  toggleDiscussionResolved,
} from "../controllers/discussionController.js";

import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/course/:courseId",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  getCourseDiscussions,
);

router.post(
  "/course/:courseId",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  createDiscussion,
);

router.post(
  "/:discussionId/replies",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  replyToDiscussion,
);

router.patch(
  "/:discussionId/resolved",
  protect,
  authorizeRoles("student", "instructor", "admin"),
  toggleDiscussionResolved,
);

export default router;