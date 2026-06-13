import { useEffect, useState } from "react";

import { getInstructorAnalytics } from "../services/courseService";
import CoursePerformanceTable from "../components/instructorDashboard/CoursePerformanceTable";
import QuizAnalyticsCard from "../components/instructorDashboard/QuizAnalyticsCard";
import RecentQuizAttempts from "../components/instructorDashboard/RecentQuizAttempts";
import TopCourseCard from "../components/instructorDashboard/TopCourseCard";

function InstructorAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setError("");

      const data = await getInstructorAnalytics();

      setAnalytics(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load instructor analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-56 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-28 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Analytics
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Instructor Analytics
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Analyze course performance, revenue, quiz attempts, pass rates, and
          recent learner activity.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <TopCourseCard course={analytics?.topCourse} />
        <QuizAnalyticsCard quizAnalytics={analytics?.quizAnalytics} />
      </div>

      <CoursePerformanceTable courses={analytics?.coursePerformance || []} />

      <RecentQuizAttempts attempts={analytics?.recentQuizAttempts || []} />
    </section>
  );
}

export default InstructorAnalyticsPage;
