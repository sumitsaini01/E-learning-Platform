import { Link } from "react-router-dom";
import DashboardSection from "./DashboardSection";

function ContinueLearning({ continueCourses = [] }) {
  if (continueCourses.length === 0) {
    return null;
  }

  return (
    <DashboardSection title="Continue Learning">
      <div className="grid gap-4 lg:grid-cols-3">
        {continueCourses.map(({ course, courseId, progress, percentage }) => (
          <div
            key={courseId}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              In Progress
            </p>

            <h3 className="mt-2 line-clamp-2 font-semibold text-slate-950 dark:text-white">
              {course.title}
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {progress?.continueLesson?.lessonTitle
                ? `Last lesson: ${progress.continueLesson.lessonTitle}`
                : "Continue from your last activity"}
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {percentage}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <Link
              to={`/courses/${courseId}`}
              className="mt-5 inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Resume Course
            </Link>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

export default ContinueLearning;
