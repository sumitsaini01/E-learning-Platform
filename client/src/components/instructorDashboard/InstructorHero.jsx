import { Link } from "react-router-dom";
import { BookOpen, PlusCircle } from "lucide-react";

function InstructorHero({ user }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 shadow-sm dark:border-blue-900 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/30">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Instructor Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            Welcome back, {user?.name || "Instructor"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Manage your courses, track enrollments, review quiz performance, and
            grow your learning business from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/instructor/create-course"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <PlusCircle size={18} />
            Create Course
          </Link>

          <Link
            to="/instructor/quizzes"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <BookOpen size={18} />
            Manage Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default InstructorHero;
