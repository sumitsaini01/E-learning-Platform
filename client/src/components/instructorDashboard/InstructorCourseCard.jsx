import { Edit, EyeOff, Send, Trash2, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

function InstructorCourseCard({
  course,
  actionLoadingId = "",
  onPublish,
  onUnpublish,
  onDelete,
}) {
  if (!course) return null;

  const courseId = course._id || course.id;
  const isActionLoading = actionLoadingId === courseId;
  const isPublished = course.status === "published";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
            {course.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {course.category}
            </span>

            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {course.level}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                isPublished
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {course.status}
            </span>
          </div>
        </div>

        <p className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          ₹{course.price}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Users size={16} />
          {course.students || 0} students
        </span>

        <span className="inline-flex items-center gap-1">
          <Star size={16} />
          {(course.averageRating || 0).toFixed(1)} rating
        </span>

        <span>{course.numReviews || 0} reviews</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/instructor/courses/${courseId}/edit`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Edit size={16} />
          Edit
        </Link>

        {isPublished ? (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onUnpublish(courseId)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            <EyeOff size={16} />
            {isActionLoading ? "Updating..." : "Draft"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onPublish(courseId)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            <Send size={16} />
            {isActionLoading ? "Publishing..." : "Publish"}
          </button>
        )}

        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => onDelete(courseId)}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          <Trash2 size={16} />
          {isActionLoading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default InstructorCourseCard;
