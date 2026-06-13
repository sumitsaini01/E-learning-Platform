import {
  Award,
  BarChart3,
  CheckCircle2,
  FileQuestion,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import QuizAttemptCard from "../components/quizzes/QuizAttemptCard";
import QuizStatCard from "../components/quizzes/QuizStatCard";
import { getMyQuizAttempts } from "../services/quizService";

function QuizzesPage() {
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadQuizAttempts = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getMyQuizAttempts();

      setAttempts(data.attempts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load quiz attempts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuizAttempts();
  }, []);

  const stats = useMemo(() => {
    const totalAttempts = attempts.length;
    const passed = attempts.filter((attempt) => attempt.passed).length;
    const failed = totalAttempts - passed;

    const averageScore =
      totalAttempts === 0
        ? 0
        : Math.round(
            attempts.reduce(
              (total, attempt) => total + Number(attempt.percentage || 0),
              0,
            ) / totalAttempts,
          );

    const bestScore =
      totalAttempts === 0
        ? 0
        : Math.max(...attempts.map((attempt) => attempt.percentage || 0));

    return {
      totalAttempts,
      passed,
      failed,
      averageScore,
      bestScore,
    };
  }, [attempts]);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-52 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Quizzes
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          My Quiz Performance
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Track your quiz attempts, scores, pass status, and course-wise
          results.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <QuizStatCard
          title="Total Attempts"
          value={stats.totalAttempts}
          icon={<FileQuestion size={22} />}
          color="blue"
        />

        <QuizStatCard
          title="Passed"
          value={stats.passed}
          icon={<CheckCircle2 size={22} />}
          color="emerald"
        />

        <QuizStatCard
          title="Failed"
          value={stats.failed}
          icon={<XCircle size={22} />}
          color="red"
        />

        <QuizStatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={<BarChart3 size={22} />}
          color="purple"
        />

        <QuizStatCard
          title="Best Score"
          value={`${stats.bestScore}%`}
          icon={<Award size={22} />}
          color="amber"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Quiz History
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your recent quiz attempts and results.
            </p>
          </div>

          <Link
            to="/my-courses"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Go to My Courses
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {attempts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                No quiz attempts yet
              </h3>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Open an enrolled course and attempt available quizzes.
              </p>

              <Link
                to="/my-courses"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View My Courses
              </Link>
            </div>
          ) : (
            attempts.map((attempt) => (
              <QuizAttemptCard key={attempt._id} attempt={attempt} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default QuizzesPage;
