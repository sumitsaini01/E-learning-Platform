import {
  BarChart3,
  Clock,
  Edit,
  FileQuestion,
  Sparkles,
  Trash2,
} from "lucide-react";

function InstructorQuizCard({
  quiz,
  isActionLoading = false,
  onEdit,
  onDelete,
  onViewAnalytics,
}) {
  if (!quiz) return null;

  const questionCount = quiz.questions?.length || 0;
  const courseTitle = quiz.course?.title || "Course";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              {quiz.title}
            </h3>

            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                quiz.status === "published"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {quiz.status}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                quiz.source === "ai"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {quiz.source === "ai" ? <Sparkles size={12} /> : null}
              {quiz.source || "manual"}
            </span>
          </div>

          {quiz.description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {quiz.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge icon={<FileQuestion size={14} />}>
              {questionCount} questions
            </Badge>

            <Badge>Passing {quiz.passingPercentage || 60}%</Badge>

            {Number(quiz.timeLimitMinutes || 0) > 0 ? (
              <Badge icon={<Clock size={14} />}>
                {quiz.timeLimitMinutes} min
              </Badge>
            ) : (
              <Badge>No time limit</Badge>
            )}

            {Number(quiz.maxAttempts || 0) > 0 ? (
              <Badge>{quiz.maxAttempts} attempts</Badge>
            ) : (
              <Badge>Unlimited attempts</Badge>
            )}
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Course:{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {courseTitle}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => onViewAnalytics?.(quiz)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <BarChart3 size={16} />
            Analytics
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(quiz)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Edit size={16} />
            Edit
          </button>

          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onDelete?.(quiz)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            <Trash2 size={16} />
            {isActionLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Badge({ children, icon }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {icon}
      {children}
    </span>
  );
}

export default InstructorQuizCard;
