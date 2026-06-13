import { BarChart3, CheckCircle2, Target, XCircle } from "lucide-react";

function QuizAnalyticsPanel({ analytics, isLoading = false, onClose }) {
  if (!analytics) return null;

  return (
    <div className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-900 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
            Quiz Analytics
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {analytics.quizTitle}
          </h2>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Course: {analytics.courseTitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Close
        </button>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Loading analytics...
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <AnalyticsCard
              label="Attempts"
              value={analytics.totalAttempts}
              icon={<BarChart3 size={20} />}
              color="purple"
            />

            <AnalyticsCard
              label="Passed"
              value={analytics.passed}
              icon={<CheckCircle2 size={20} />}
              color="emerald"
            />

            <AnalyticsCard
              label="Failed"
              value={analytics.failed}
              icon={<XCircle size={20} />}
              color="red"
            />

            <AnalyticsCard
              label="Average"
              value={`${analytics.averageScore}%`}
              icon={<Target size={20} />}
              color="blue"
            />

            <AnalyticsCard
              label="Pass Rate"
              value={`${analytics.passRate}%`}
              icon={<BarChart3 size={20} />}
              color="amber"
            />
          </div>

          {analytics.mostMissedQuestion ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/20">
              <h3 className="font-bold text-slate-950 dark:text-white">
                Most Missed Question
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {analytics.mostMissedQuestion.questionText}
              </p>

              <p className="mt-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
                Missed {analytics.mostMissedQuestion.missedCount} times
              </p>
            </div>
          ) : null}

          {analytics.recentAttempts?.length ? (
            <div className="mt-6">
              <h3 className="font-bold text-slate-950 dark:text-white">
                Recent Attempts
              </h3>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="py-3 pr-4 font-semibold">Student</th>
                      <th className="py-3 pr-4 font-semibold">Score</th>
                      <th className="py-3 pr-4 font-semibold">Result</th>
                      <th className="py-3 pr-4 font-semibold">Submitted</th>
                    </tr>
                  </thead>

                  <tbody>
                    {analytics.recentAttempts.map((attempt) => (
                      <tr
                        key={attempt.attemptId}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-3 pr-4 text-slate-800 dark:text-slate-200">
                          {attempt.student?.name ||
                            attempt.student?.email ||
                            "Student"}
                        </td>

                        <td className="py-3 pr-4 font-semibold text-slate-950 dark:text-white">
                          {attempt.percentage}%
                        </td>

                        <td className="py-3 pr-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              attempt.passed
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            }`}
                          >
                            {attempt.passed ? "Passed" : "Failed"}
                          </span>
                        </td>

                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function AnalyticsCard({ label, value, icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300",
    red: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300",
  };

  return (
    <div className={`rounded-2xl p-4 ${colors[color] || colors.blue}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        {icon}
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
        {value || 0}
      </p>
    </div>
  );
}

export default QuizAnalyticsPanel;
