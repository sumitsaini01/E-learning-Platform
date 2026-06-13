import { Link } from "react-router-dom";

function CourseQuizzes({ quizzes = [], isAuthenticated, user, isEnrolled }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
        Course Quizzes
      </h2>

      <div className="mt-5 space-y-4">
        {quizzes.length === 0 ? (
          <p className="rounded-md bg-stone-50 p-4 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
            No quizzes available for this course yet.
          </p>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="rounded-2xl border border-zinc-200 p-5 dark:border-slate-800"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-950 dark:text-white">
                    {quiz.title}
                  </h3>

                  {quiz.description ? (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-slate-400">
                      {quiz.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge color="emerald">
                      {quiz.questions?.length || 0} questions
                    </Badge>

                    <Badge color="amber">
                      Passing {quiz.passingPercentage}%
                    </Badge>

                    {quiz.timeLimitMinutes > 0 ? (
                      <Badge color="blue">{quiz.timeLimitMinutes} min</Badge>
                    ) : null}

                    {quiz.maxAttempts > 0 ? (
                      <Badge>{quiz.maxAttempts} attempts</Badge>
                    ) : (
                      <Badge>Unlimited attempts</Badge>
                    )}
                  </div>
                </div>

                {isAuthenticated && user?.role === "student" && isEnrolled ? (
                  <Link
                    to={`/quizzes/${quiz._id}/attempt`}
                    className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Attempt Quiz
                  </Link>
                ) : (
                  <p className="rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
                    Enroll to attempt
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Badge({ children, color = "zinc" }) {
  const colorClasses = {
    emerald:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 font-medium ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}

export default CourseQuizzes;
