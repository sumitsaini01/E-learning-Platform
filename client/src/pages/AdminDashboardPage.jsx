import { useEffect, useState } from "react";

import {
  deleteAdminCourse,
  deleteAdminUser,
  getAdminCertificateAnalytics,
  getAdminCourseAnalytics,
  getAdminCourses,
  getAdminDashboard,
  getAdminEnrollmentAnalytics,
  getAdminPlatformMonitoring,
  getAdminQuizAnalytics,
  getAdminRevenueAnalytics,
  getAdminUserAnalytics,
  getAdminUsers,
  updateAdminCourseStatus,
  updateUserRole,
  updateUserVerificationStatus,
} from "../services/adminService";

import AdminAnalyticsSection from "../components/admin/AdminAnalyticsSection";
import AdminMonitoringSection from "../components/admin/AdminMonitoringSection";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminRecentCourses from "../components/admin/AdminRecentCourses";
import AdminRecentPayments from "../components/admin/AdminRecentPayments";
import AdminRecentUsers from "../components/admin/AdminRecentUsers";
import AdminStatsSection from "../components/admin/AdminStatsSection";

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [enrollmentAnalytics, setEnrollmentAnalytics] = useState(null);
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [certificateAnalytics, setCertificateAnalytics] = useState(null);
  const [platformMonitoring, setPlatformMonitoring] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [updatingCourseId, setUpdatingCourseId] = useState("");

  const loadAdminData = async () => {
    try {
      setError("");

      const [
        dashboardData,
        userAnalyticsData,
        courseAnalyticsData,
        revenueAnalyticsData,
        enrollmentAnalyticsData,
        quizAnalyticsData,
        certificateAnalyticsData,
        platformMonitoringData,
        usersData,
        coursesData,
      ] = await Promise.all([
        getAdminDashboard(),
        getAdminUserAnalytics(),
        getAdminCourseAnalytics(),
        getAdminRevenueAnalytics(),
        getAdminEnrollmentAnalytics(),
        getAdminQuizAnalytics(),
        getAdminCertificateAnalytics(),
        getAdminPlatformMonitoring(),
        getAdminUsers({ limit: 8 }),
        getAdminCourses({ limit: 8 }),
      ]);

      setDashboard(dashboardData);
      setUserAnalytics(userAnalyticsData.analytics);
      setCourseAnalytics(courseAnalyticsData.analytics);
      setRevenueAnalytics(revenueAnalyticsData.analytics);
      setEnrollmentAnalytics(enrollmentAnalyticsData.analytics);
      setQuizAnalytics(quizAnalyticsData.analytics);
      setCertificateAnalytics(certificateAnalyticsData.analytics);
      setPlatformMonitoring(platformMonitoringData.monitoring);
      setUsers(usersData.users || []);
      setCourses(coursesData.courses || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load admin dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      setError("");
      setSuccess("");
      setUpdatingUserId(userId);

      const data = await updateUserRole(userId, role);

      setUsers((current) =>
        current.map((item) => (item._id === userId ? data.user : item)),
      );

      setSuccess(data.message || "User role updated successfully.");
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user role.");
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleVerificationChange = async (userId, isEmailVerified) => {
    try {
      setError("");
      setSuccess("");
      setUpdatingUserId(userId);

      const data = await updateUserVerificationStatus(userId, isEmailVerified);

      setSuccess(data.message || "User verification updated.");
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update verification.");
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user and related records?")) return;

    try {
      setError("");
      setSuccess("");
      setUpdatingUserId(userId);

      const data = await deleteAdminUser(userId);

      setSuccess(data.message || "User deleted successfully.");
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete user.");
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleCourseStatusChange = async (courseId, status) => {
    try {
      setError("");
      setSuccess("");
      setUpdatingCourseId(courseId);

      const data = await updateAdminCourseStatus(courseId, status);

      setSuccess(data.message || "Course status updated.");
      await loadAdminData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update course status.",
      );
    } finally {
      setUpdatingCourseId("");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course and all related records?")) return;

    try {
      setError("");
      setSuccess("");
      setUpdatingCourseId(courseId);

      const data = await deleteAdminCourse(courseId);

      setSuccess(data.message || "Course deleted successfully.");
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete course.");
    } finally {
      setUpdatingCourseId("");
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-56 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-10 w-80 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
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

  const summary = dashboard?.summary || {};

  return (
    <section className="space-y-8">
      <AdminPageHeader
        badge="Admin Dashboard"
        title="SkillSphere Platform Control"
        description="Monitor users, courses, enrollments, revenue, quizzes, certificates, and platform activity."
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

      <AdminStatsSection summary={summary} />

      <AdminAnalyticsSection
        userAnalytics={userAnalytics}
        courseAnalytics={courseAnalytics}
        revenueAnalytics={revenueAnalytics}
        enrollmentAnalytics={enrollmentAnalytics}
        quizAnalytics={quizAnalytics}
        certificateAnalytics={certificateAnalytics}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminRecentUsers
          users={users}
          updatingUserId={updatingUserId}
          onRoleChange={handleRoleChange}
          onVerificationChange={handleVerificationChange}
          onDeleteUser={handleDeleteUser}
        />

        <AdminRecentCourses
          courses={courses}
          updatingCourseId={updatingCourseId}
          onStatusChange={handleCourseStatusChange}
          onDeleteCourse={handleDeleteCourse}
        />
      </div>

      <AdminRecentPayments orders={dashboard?.recentOrders || []} />

      <AdminMonitoringSection monitoring={platformMonitoring} />
    </section>
  );
}

export default AdminDashboardPage;
