import QuizStatusBadge from "../quizzes/QuizStatusBadge";

function RecentQuizAttempts({ attempts = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Recent Quiz Attempts
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Latest quiz submissions from your students.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {attempts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No quiz attempts yet.
          </p>
        ) : (
          attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">
                  {attempt.quizTitle}
                </p>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {attempt.student?.name || "Student"} • {attempt.courseTitle} •{" "}
                  {attempt.percentage}%
                </p>
              </div>

              <QuizStatusBadge passed={attempt.passed} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentQuizAttempts;
