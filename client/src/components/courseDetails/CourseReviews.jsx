import StarRatingInput from "./StarRatingInput";

function CourseReviews({
  course,
  reviews = [],
  reviewMessage,
  reviewError,
  canReview,
  reviewForm,
  setReviewForm,
  handleSubmitReview,
  isReviewing,
  isAuthenticated,
  user,
  isEnrolled,
  hasReviewed,
  getUserId,
  studentId,
  editingReviewId,
  editReviewForm,
  setEditReviewForm,
  handleUpdateReview,
  setEditingReviewId,
  startEditReview,
  handleDeleteReview,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
            Reviews & Ratings
          </h2>

          <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
            Average rating: {(course.averageRating || 0).toFixed(1)} / 5 from{" "}
            {course.numReviews || 0} reviews.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-4 py-2 dark:bg-amber-950/30">
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {(course.averageRating || 0).toFixed(1)}
          </span>
          <span className="text-amber-500">★</span>
        </div>
      </div>

      {reviewMessage ? <Alert type="success">{reviewMessage}</Alert> : null}
      {reviewError ? <Alert type="error">{reviewError}</Alert> : null}

      {canReview ? (
        <form
          onSubmit={handleSubmitReview}
          className="mt-5 rounded-xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900 dark:bg-amber-950/20"
        >
          <h3 className="font-semibold text-zinc-950 dark:text-white">
            Write a review
          </h3>

          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-800 dark:text-slate-300">
              Your rating
            </label>

            <div className="mt-2">
              <StarRatingInput
                value={reviewForm.rating}
                onChange={(rating) =>
                  setReviewForm((current) => ({
                    ...current,
                    rating,
                  }))
                }
                disabled={isReviewing}
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-zinc-800 dark:text-slate-300"
            >
              Comment
            </label>

            <textarea
              id="comment"
              name="comment"
              value={reviewForm.comment}
              onChange={(event) =>
                setReviewForm((current) => ({
                  ...current,
                  comment: event.target.value,
                }))
              }
              className={textareaClass}
              placeholder="Share your experience with this course."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isReviewing || !reviewForm.comment.trim()}
            className="mt-4 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            {isReviewing ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : isAuthenticated &&
        user?.role === "student" &&
        isEnrolled &&
        hasReviewed ? (
        <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
          You have already reviewed this course. You can edit or delete your
          review below.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="rounded-md bg-stone-50 p-4 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
            No reviews yet.
          </p>
        ) : (
          reviews.map((review) => {
            const isOwnReview = getUserId(review.user) === studentId;
            const isEditing = editingReviewId === review._id;

            return (
              <div
                key={review._id}
                className="rounded-xl border border-zinc-200 p-5 shadow-sm dark:border-slate-800"
              >
                {isEditing ? (
                  <form onSubmit={handleUpdateReview}>
                    <div>
                      <label className="block text-sm font-medium text-zinc-800 dark:text-slate-300">
                        Edit rating
                      </label>

                      <div className="mt-2">
                        <StarRatingInput
                          value={editReviewForm.rating}
                          onChange={(rating) =>
                            setEditReviewForm((current) => ({
                              ...current,
                              rating,
                            }))
                          }
                          disabled={isReviewing}
                        />
                      </div>
                    </div>

                    <textarea
                      value={editReviewForm.comment}
                      onChange={(event) =>
                        setEditReviewForm((current) => ({
                          ...current,
                          comment: event.target.value,
                        }))
                      }
                      className={textareaClass}
                      required
                    />

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={isReviewing || !editReviewForm.comment.trim()}
                        className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:bg-amber-300"
                      >
                        {isReviewing ? "Saving..." : "Save Review"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingReviewId("")}
                        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-zinc-950 dark:text-white">
                          {review.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <div className="text-lg text-amber-500">
                            {"★".repeat(review.rating)}
                            <span className="text-zinc-300 dark:text-slate-700">
                              {"★".repeat(5 - review.rating)}
                            </span>
                          </div>

                          <span className="text-sm text-zinc-500 dark:text-slate-400">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      {isOwnReview ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditReview(review)}
                            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review._id)}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-slate-400">
                      {review.comment}
                    </p>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Alert({ type, children }) {
  const className =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";

  return (
    <div className={`mt-5 rounded-md border px-3 py-2 text-sm ${className}`}>
      {children}
    </div>
  );
}

const textareaClass =
  "mt-2 min-h-28 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-amber-500 dark:focus:ring-amber-950";

export default CourseReviews;
