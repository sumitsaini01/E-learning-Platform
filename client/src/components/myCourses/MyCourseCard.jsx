import { BookOpen, CheckCircle2, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

function MyCourseCard({
  course,
  percentage = 0,
  completed = 0,
  totalLessons = 0,
}) {
  const courseId = course?._id || course?.id;

  const isCompleted = percentage >= 100;

  const status = isCompleted
    ? {
        label: "Completed",
        className:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        icon: <CheckCircle2 size={14} />,
      }
    : percentage > 0
      ? {
          label: "In Progress",
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
          icon: <PlayCircle size={14} />,
        }
      : {
          label: "Not Started",
          className:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          icon: <BookOpen size={14} />,
        };

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="relative">
        {course?.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-52 w-full object-cover"
          />
        ) : (
          <div className="flex h-52 items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <span className="text-lg font-semibold">SkillSphere</span>
          </div>
        )}

        <div
          className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.icon}
          {status.label}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
              {course.title}
            </h3>

            <p className="mt-2 text-sm capitalize text-slate-500 dark:text-slate-400">
              {course.category} • {course.level}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {course.description}
        </p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {completed} / {totalLessons} lessons completed
            </span>

            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {percentage}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="mt-6">
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {percentage > 0 ? "Continue Learning" : "Start Learning"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default MyCourseCard;
