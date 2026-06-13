import { PlusCircle } from "lucide-react";

function QuizPageHeader({ onCreateClick }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Quiz Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            Instructor Quizzes
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Create, manage, publish, and analyze quizzes across your courses.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Create Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizPageHeader;
