import {
  CheckCircle2,
  FileQuestion,
  Percent,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import AdminAnalyticsList from "../../components/admin/AdminAnalyticsList";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import {
  deleteQuiz,
  getInstructorQuizzes,
  getQuizAnalytics,
  updateQuiz,
} from "../../services/quizService";
import { getAdminQuizAnalytics } from "../../services/adminService";

function AdminQuizzesPage() {
  const [analytics, setAnalytics] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [analyticsData, quizzesData] = await Promise.all([
        getAdminQuizAnalytics(),
        getInstructorQuizzes(),
      ]);

      setAnalytics(analyticsData.analytics);
      setQuizzes(quizzesData.quizzes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin quizzes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (quiz, status) => {
    try {
      setActionLoadingId(quiz._id);
      setError("");
      setSuccess("");

      const payload = {
        title: quiz.title,
        description: quiz.description || "",
        sectionId: quiz.sectionId || "",
        lessonId: quiz.lessonId || "",
        passingPercentage: quiz.passingPercentage || 60,
        timeLimitMinutes: quiz.timeLimitMinutes || 0,
        maxAttempts: quiz.maxAttempts || 0,
        status,
        source: quiz.source || "manual",
        aiPrompt: quiz.aiPrompt || "",
      };

      const data = await updateQuiz(quiz._id, payload);

      setSuccess(data.message || "Quiz status updated.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update quiz status.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz and all attempts?")) return;

    try {
      setActionLoadingId(quizId);
      setError("");
      setSuccess("");

      const data = await deleteQuiz(quizId);

      setSuccess(data.message || "Quiz deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete quiz.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleViewAnalytics = async (quizId) => {
    try {
      setError("");
      setSelectedAnalytics(null);

      const data = await getQuizAnalytics(quizId);

      setSelectedAnalytics(data.analytics);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load quiz analytics.");
    }
  };

  if (isLoading) {
    return (
      <p className="text-slate-500 dark:text-slate-400">
        Loading quiz management...
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        badge="Quiz Management"
        title="Admin Quizzes"
        description="Moderate all platform quizzes. Admin can publish, move to draft, delete, and view analytics."
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Total Quizzes"
          value={analytics?.totalQuizzes || 0}
          icon={FileQuestion}
        />
        <AdminStatCard
          title="Attempts"
          value={analytics?.totalAttempts || 0}
          icon={CheckCircle2}
        />
        <AdminStatCard
          title="Pass Rate"
          value={`${analytics?.passRate || 0}%`}
          icon={Percent}
        />
        <AdminStatCard
          title="Failed Attempts"
          value={analytics?.failedAttempts || 0}
          icon={XCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminAnalyticsList
          title="Top Attempted Quizzes"
          items={(analytics?.topAttemptedQuizzes || []).map((quiz) => ({
            label: quiz.title,
            value: `${quiz.attempts} attempts • ${quiz.averageScore}% avg`,
          }))}
        />

        <AdminAnalyticsList
          title="Quiz Summary"
          items={[
            { label: "Published", value: analytics?.publishedQuizzes || 0 },
            { label: "Draft", value: analytics?.draftQuizzes || 0 },
            { label: "Passed Attempts", value: analytics?.passedAttempts || 0 },
            {
              label: "Average Score",
              value: `${analytics?.averageScore || 0}%`,
            },
          ]}
        />
      </div>

      {selectedAnalytics ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            {selectedAnalytics.quizTitle}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              title="Attempts"
              value={selectedAnalytics.totalAttempts || 0}
            />
            <AdminStatCard
              title="Passed"
              value={selectedAnalytics.passed || 0}
            />
            <AdminStatCard
              title="Failed"
              value={selectedAnalytics.failed || 0}
            />
            <AdminStatCard
              title="Average Score"
              value={`${selectedAnalytics.averageScore || 0}%`}
            />
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          All Quizzes
        </h2>

        <div className="mt-6 space-y-4">
          {quizzes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No quizzes found.
            </p>
          ) : (
            quizzes.map((quiz) => {
              const isPublished = quiz.status === "published";
              const isActionLoading = actionLoadingId === quiz._id;

              return (
                <div
                  key={quiz._id}
                  className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-950 dark:text-white">
                          {quiz.title}
                        </h3>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                            isPublished
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {quiz.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Course: {quiz.course?.title || "Unknown Course"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Instructor: {quiz.instructor?.name || "Unknown"} •{" "}
                        Passing: {quiz.passingPercentage}% • Questions:{" "}
                        {quiz.questions?.length || 0}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() =>
                          handleStatusChange(
                            quiz,
                            isPublished ? "draft" : "published",
                          )
                        }
                        className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {isPublished ? "Move to Draft" : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleViewAnalytics(quiz._id)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        View Analytics
                      </button>

                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminQuizzesPage;
