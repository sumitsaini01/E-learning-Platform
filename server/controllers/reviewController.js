import Review from "../models/Review.js";

// ✅ Add review
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.create({
      course: req.params.id,
      user: req.user._id,
      rating,
      comment,
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