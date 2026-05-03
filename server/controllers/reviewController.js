import Review from "../models/Review.js";
import Course from "../models/Course.js";

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.create({
      course: req.params.id,
      user: req.user._id,
      rating,
      comment,
    });

    // 🔥 Recalculate rating
    const reviews = await Review.find({ course: req.params.id });

    const avgRating =
      reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

    await Course.findByIdAndUpdate(req.params.id, {
      averageRating: avgRating,
      numReviews: reviews.length,
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(400).json({
      message: "You already reviewed this course",
    });
  }
};

// ✅ Get reviews
export const getCourseReviews = async (req, res) => {
  const reviews = await Review.find({ course: req.params.id })
    .populate("user", "name");

  res.json({
    success: true,
    count: reviews.length,
    reviews,
  });
};