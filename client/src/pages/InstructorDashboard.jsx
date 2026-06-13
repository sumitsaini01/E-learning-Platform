import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getInstructorAnalytics } from "../services/courseService";
import CoursePerformanceTable from "../components/instructorDashboard/CoursePerformanceTable";
import InstructorHero from "../components/instructorDashboard/InstructorHero";
import InstructorStats from "../components/instructorDashboard/InstructorStats";
import QuizAnalyticsCard from "../components/instructorDashboard/QuizAnalyticsCard";
import RecentQuizAttempts from "../components/instructorDashboard/RecentQuizAttempts";
import StudentAnalyticsTable from "../components/instructorDashboard/StudentAnalyticsTable";
import TopCourseCard from "../components/instructorDashboard/TopCourseCard";

function InstructorDashboard() {
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setError("");

      const analyticsData = await getInstructorAnalytics();

      setAnalytics(analyticsData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load instructor dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-10 w-72 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <InstructorHero user={user} />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <InstructorStats summary={analytics?.summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopCourseCard course={analytics?.topCourse} />

        <QuizAnalyticsCard quizAnalytics={analytics?.quizAnalytics} />
      </div>

      <StudentAnalyticsTable
        studentAnalytics={analytics?.studentAnalytics || []}
      />

      <CoursePerformanceTable courses={analytics?.coursePerformance || []} />

      <RecentQuizAttempts attempts={analytics?.recentQuizAttempts || []} />
    </section>
  );
}

export default InstructorDashboard;
