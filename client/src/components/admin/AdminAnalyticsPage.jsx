import { useEffect, useState } from "react";
import AdminAnalyticsSection from "../../components/admin/AdminAnalyticsSection";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import {
  getAdminCertificateAnalytics,
  getAdminCourseAnalytics,
  getAdminEnrollmentAnalytics,
  getAdminQuizAnalytics,
  getAdminRevenueAnalytics,
  getAdminUserAnalytics,
} from "../../services/adminService";

function AdminAnalyticsPage() {
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [users, courses, revenue, enrollments, quizzes, certificates] =
          await Promise.all([
            getAdminUserAnalytics(),
            getAdminCourseAnalytics(),
            getAdminRevenueAnalytics(),
            getAdminEnrollmentAnalytics(),
            getAdminQuizAnalytics(),
            getAdminCertificateAnalytics(),
          ]);

        setData({
          userAnalytics: users.analytics,
          courseAnalytics: courses.analytics,
          revenueAnalytics: revenue.analytics,
          enrollmentAnalytics: enrollments.analytics,
          quizAnalytics: quizzes.analytics,
          certificateAnalytics: certificates.analytics,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load analytics.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading)
    return (
      <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>
    );

  return (
    <section className="space-y-6">
      <AdminPageHeader
        badge="Platform Analytics"
        title="Admin Analytics"
        description="View complete platform analytics in one place."
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <AdminAnalyticsSection {...data} />
    </section>
  );
}

export default AdminAnalyticsPage;
