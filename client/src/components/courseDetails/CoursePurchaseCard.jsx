import { Link } from "react-router-dom";

function CoursePurchaseCard({
  course,
  formatPrice,
  isAuthenticated,
  user,
  location,
  isSaved,
  isSavingCourse,
  handleToggleSaveCourse,
  canTrackProgress,
  percentage,
  completed,
  totalLessons,
  isEnrolled,
  enrollMessage,
  enrollError,
  canPurchase,
  handleBuyCourse,
  isEnrolling,
  isFreeCourse,
  instructorName,
  instructorEmail,
}) {
  return (
    <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-zinc-500 dark:text-slate-400">Price</p>

      <p className="mt-1 text-3xl font-semibold text-zinc-950 dark:text-white">
        {formatPrice(course.price)}
      </p>

      {isAuthenticated && user?.role === "student" ? (
        <button
          type="button"
          onClick={handleToggleSaveCourse}
          disabled={isSavingCourse}
          className="mt-4 w-full rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-800 dark:bg-slate-950 dark:text-blue-300 dark:hover:bg-blue-950/40"
        >
          {isSavingCourse ? "Updating..." : isSaved ? "Saved ✓" : "Save Course"}
        </button>
      ) : null}

      <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-slate-800">
        <p className="text-sm text-zinc-500 dark:text-slate-400">Instructor</p>

        <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
          {instructorName}
        </p>

        {instructorEmail ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
            {instructorEmail}
          </p>
        ) : null}
      </div>

      {canTrackProgress ? (
        <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-slate-300">
              Progress
            </span>
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              {percentage}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-zinc-500 dark:text-slate-400">
            {completed} of {totalLessons} lessons completed
          </p>
        </div>
      ) : null}

      {isEnrolled ? (
        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          You are enrolled in this course.
        </div>
      ) : null}

      {enrollMessage ? (
        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {enrollMessage}
        </div>
      ) : null}

      {enrollError ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {enrollError}
        </div>
      ) : null}

      {canPurchase ? (
        <button
          type="button"
          onClick={handleBuyCourse}
          disabled={isEnrolling}
          className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isEnrolling
            ? isFreeCourse
              ? "Enrolling..."
              : "Processing..."
            : isFreeCourse
              ? "Enroll for Free"
              : "Buy Now"}
        </button>
      ) : !isAuthenticated ? (
        <Link
          to="/login"
          state={{ from: location }}
          className="mt-6 inline-flex w-full justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Login as student to continue
        </Link>
      ) : null}
    </aside>
  );
}

export default CoursePurchaseCard;
