import { BarChart3, CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";

function QuizAnalyticsCard({ quizAnalytics }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <BarChart3 size={22} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Quiz Analytics
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Student performance across all quizzes.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Attempts
            </p>

            <ClipboardCheck
              size={18}
              className="text-slate-500 dark:text-slate-400"
            />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {quizAnalytics?.totalAttempts || 0}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Average Score
            </p>

            <BarChart3
              size={18}
              className="text-slate-500 dark:text-slate-400"
            />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {quizAnalytics?.averageScore || 0}%
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Passed
            </p>

            <CheckCircle2
              size={18}
              className="text-emerald-700 dark:text-emerald-300"
            />
          </div>

          <p className="mt-3 text-3xl font-bold text-emerald-900 dark:text-emerald-200">
            {quizAnalytics?.passedAttempts || 0}
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-950/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">Failed</p>

            <XCircle size={18} className="text-red-700 dark:text-red-300" />
          </div>

          <p className="mt-3 text-3xl font-bold text-red-900 dark:text-red-200">
            {quizAnalytics?.failedAttempts || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuizAnalyticsCard;
