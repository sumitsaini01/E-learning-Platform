import {
  Activity,
  Award,
  BookOpen,
  FileQuestion,
  Receipt,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import AdminAnalyticsList from "../../components/admin/AdminAnalyticsList";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import { getAdminPlatformMonitoring } from "../../services/adminService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function AdminMonitoringPage() {
  const [monitoring, setMonitoring] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadMonitoring = async () => {
    try {
      setError("");

      const data = await getAdminPlatformMonitoring();

      setMonitoring(data.monitoring);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load platform monitoring.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoring();
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading platform monitoring...
        </p>
      </section>
    );
  }

  const latestUsers = monitoring?.latestUsers || [];
  const latestCourses = monitoring?.latestCourses || [];
  const latestOrders = monitoring?.latestOrders || [];
  const latestCertificates = monitoring?.latestCertificates || [];
  const latestQuizAttempts = monitoring?.latestQuizAttempts || [];

  return (
    <section className="space-y-6">
      <AdminPageHeader
        badge="Platform Monitoring"
        title="System Activity"
        description="Monitor recent users, courses, payments, certificates, and quiz attempts."
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard
          title="Latest Users"
          value={latestUsers.length}
          subtitle="Recent accounts"
          icon={Users}
        />

        <AdminStatCard
          title="Latest Courses"
          value={latestCourses.length}
          subtitle="Recently created courses"
          icon={BookOpen}
        />

        <AdminStatCard
          title="Latest Orders"
          value={latestOrders.length}
          subtitle="Recent payments"
          icon={Receipt}
        />

        <AdminStatCard
          title="Certificates"
          value={latestCertificates.length}
          subtitle="Recent certificates"
          icon={Award}
        />

        <AdminStatCard
          title="Quiz Attempts"
          value={latestQuizAttempts.length}
          subtitle="Recent quiz activity"
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminAnalyticsList
          title="Latest Users"
          items={latestUsers.map((user) => ({
            label: user.name,
            value: user.role,
          }))}
        />

        <AdminAnalyticsList
          title="Latest Courses"
          items={latestCourses.map((course) => ({
            label: course.title,
            value: course.instructor?.name || course.status,
          }))}
        />

        <AdminAnalyticsList
          title="Latest Orders"
          items={latestOrders.map((order) => ({
            label: order.course?.title || "Course",
            value: `${formatCurrency(order.amount)} • ${order.user?.name || "User"}`,
          }))}
        />

        <AdminAnalyticsList
          title="Latest Certificates"
          items={latestCertificates.map((certificate) => ({
            label: certificate.course?.title || "Course",
            value: certificate.user?.name || "Student",
          }))}
        />

        <AdminAnalyticsList
          title="Latest Quiz Attempts"
          items={latestQuizAttempts.map((attempt) => ({
            label: attempt.quiz?.title || "Quiz",
            value: `${attempt.user?.name || "Student"} • ${
              attempt.percentage || 0
            }%`,
          }))}
        />
      </div>
    </section>
  );
}

export default AdminMonitoringPage;
