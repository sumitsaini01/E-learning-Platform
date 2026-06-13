import {
  BarChart3,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getInstructorAnalytics } from "../services/courseService";
import StudentAnalyticsTable from "../components/instructorDashboard/StudentAnalyticsTable";

function InstructorStudentsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadStudentsData = async () => {
    try {
      setError("");

      const data = await getInstructorAnalytics();

      setAnalytics(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load student analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsData();
  }, []);

  const studentAnalytics = analytics?.studentAnalytics || [];
  const quizAnalytics = analytics?.quizAnalytics || {};
  const summary = analytics?.summary || {};

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-56 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-24 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Student Management
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Instructor Students
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Track enrolled students, quiz attempts, pass rates, and learning
          performance across your courses.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<Users size={22} />}
          label="Students"
          value={summary.totalStudents || 0}
        />

        <StatCard
          icon={<GraduationCap size={22} />}
          label="Enrollments"
          value={summary.totalEnrollments || 0}
        />

        <StatCard
          icon={<BarChart3 size={22} />}
          label="Quiz Attempts"
          value={quizAnalytics.totalAttempts || 0}
        />

        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Passed"
          value={quizAnalytics.passedAttempts || 0}
        />

        <StatCard
          icon={<XCircle size={22} />}
          label="Failed"
          value={quizAnalytics.failedAttempts || 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PerformanceCard
          icon={<TrendingUp size={22} />}
          label="Average Quiz Score"
          value={`${quizAnalytics.averageScore || 0}%`}
          description="Average score across all submitted quiz attempts."
        />

        <PerformanceCard
          icon={<CheckCircle2 size={22} />}
          label="Average Course Rating"
          value={(summary.averageRating || 0).toFixed(1)}
          description={`${summary.totalReviews || 0} total course reviews.`}
        />
      </div>

      <StudentAnalyticsTable studentAnalytics={studentAnalytics} />
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function PerformanceCard({ icon, label, value, description }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>

          <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      </div>
    </div>
  );
}

export default InstructorStudentsPage;
