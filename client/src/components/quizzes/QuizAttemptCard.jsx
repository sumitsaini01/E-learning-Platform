import { Link } from "react-router-dom";
import QuizStatusBadge from "./QuizStatusBadge";
import QuizProgressBar from "./QuizProgressBar";

function QuizAttemptCard({ attempt, showCourse = true, showButton = true }) {
  if (!attempt) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/30 dark:border-slate-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-950 dark:text-white">
              {attempt.quiz?.title || "Quiz"}
            </h3>

            <QuizStatusBadge passed={attempt.passed} />

            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Attempt #{attempt.attemptNumber}
            </span>
          </div>

          {showCourse && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Course: {attempt.course?.title || "Unknown Course"}
            </p>
          )}

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Score: {attempt.score}/{attempt.totalPoints} • {attempt.percentage}%
          </p>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            Submitted:{" "}
            {attempt.submittedAt
              ? new Date(attempt.submittedAt).toLocaleString()
              : "Not Submitted"}
          </p>
        </div>

        <div className="w-full lg:w-48">
          <QuizProgressBar
            percentage={attempt.percentage || 0}
            passed={attempt.passed}
          />

          {showButton && attempt.course?._id && (
            <Link
              to={`/courses/${attempt.course._id}`}
              className="mt-4 inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              View Course
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizAttemptCard;
