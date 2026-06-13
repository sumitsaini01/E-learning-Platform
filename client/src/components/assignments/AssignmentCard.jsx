import { CalendarDays, FileText, Upload } from "lucide-react";
import { Link } from "react-router-dom";

import AssignmentStatusBadge from "./AssignmentStatusBadge";

function AssignmentCard({ assignment }) {
  const {
    _id,
    title,
    description,
    courseTitle,
    dueDate,
    maxMarks,
    status = "pending",
  } = assignment;

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              {title}
            </h3>

            <AssignmentStatusBadge status={status} />
          </div>

          <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            {courseTitle}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {maxMarks} Marks
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
          <CalendarDays
            size={18}
            className="text-slate-500 dark:text-slate-400"
          />

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Due Date
            </p>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
          <FileText size={18} className="text-slate-500 dark:text-slate-400" />

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assignment Type
            </p>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Project Submission
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/assignments/${_id}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          View Details
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Upload size={16} />
          Submit
        </button>
      </div>
    </article>
  );
}

export default AssignmentCard;
