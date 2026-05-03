import express from "express";
import { addReview, getCourseReviews } from "../controllers/reviewController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id/review", protect, authorizeRoles("student"), addReview);
router.get("/:id/reviews", getCourseReviews);

export default router;