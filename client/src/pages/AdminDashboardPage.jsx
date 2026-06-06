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

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

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
        <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 rounded bg-zinc-200" />
          <div className="mt-5 h-10 w-80 rounded bg-zinc-200" />
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="h-24 rounded bg-zinc-200" />
            <div className="h-24 rounded bg-zinc-200" />
            <div className="h-24 rounded bg-zinc-200" />
            <div className="h-24 rounded bg-zinc-200" />
          </div>
        </div>
      </section>
    );
  }

  const summary = dashboard?.summary || {};

  const userStats = userAnalytics?.totals || {};
  const userGrowth = userAnalytics?.growth || {};
  const userEngagement = userAnalytics?.engagement || {};
  const courseStats = courseAnalytics?.totals || {};
  const courseGrowth = courseAnalytics?.growth || {};

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Admin Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          SkillSphere Platform Control
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Monitor users, courses, enrollments, revenue, and certificates.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Users</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {summary.totalUsers || 0}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {summary.totalStudents || 0} students •{" "}
            {summary.totalInstructors || 0} instructors
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Courses</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {summary.totalCourses || 0}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {summary.publishedCourses || 0} published •{" "}
            {summary.draftCourses || 0} draft
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {summary.paidEnrollments || 0} paid enrollments
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Certificates</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {summary.certificatesIssued || 0}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {summary.totalEnrollments || 0} total enrollments
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              User Analytics
            </p>

            <h2 className="mt-2 text-xl font-semibold text-zinc-950">
              Platform user growth and activity
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <AdminMiniCard
            label="Students"
            value={userStats.totalStudents || 0}
          />
          <AdminMiniCard
            label="Instructors"
            value={userStats.totalInstructors || 0}
          />
          <AdminMiniCard label="Admins" value={userStats.totalAdmins || 0} />
          <AdminMiniCard
            label="Verified Users"
            value={userStats.verifiedUsers || 0}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <AdminMiniCard
            label="Unverified Users"
            value={userStats.unverifiedUsers || 0}
          />

          <AdminMiniCard
            label="Joined This Month"
            value={userGrowth.usersThisMonth || 0}
          />

          <AdminMiniCard
            label="Joined Last 7 Days"
            value={userGrowth.usersLast7Days || 0}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <AdminMiniCard
            label="Active Quiz Users (30 Days)"
            value={userEngagement.activeQuizUsersLast30Days || 0}
          />

          <div className="rounded-xl border border-zinc-200 bg-stone-50 p-4">
            <p className="text-sm font-medium text-zinc-700">
              Role Distribution
            </p>

            <div className="mt-3 space-y-2 text-sm text-zinc-600">
              <p>Students: {userAnalytics?.roleDistribution?.student || 0}</p>
              <p>
                Instructors: {userAnalytics?.roleDistribution?.instructor || 0}
              </p>
              <p>Admins: {userAnalytics?.roleDistribution?.admin || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Course Analytics
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Course publishing, pricing, and category insights
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <AdminMiniCard
            label="Total Courses"
            value={courseStats.totalCourses || 0}
          />
          <AdminMiniCard
            label="Published"
            value={courseStats.publishedCourses || 0}
          />
          <AdminMiniCard label="Draft" value={courseStats.draftCourses || 0} />
          <AdminMiniCard label="Free" value={courseStats.freeCourses || 0} />
          <AdminMiniCard label="Paid" value={courseStats.paidCourses || 0} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <AdminMiniCard
            label="Created This Month"
            value={courseGrowth.coursesThisMonth || 0}
          />
          <AdminMiniCard
            label="Created Last 7 Days"
            value={courseGrowth.coursesLast7Days || 0}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <AnalyticsList
            title="Top Enrolled Courses"
            items={(courseAnalytics?.topEnrolledCourses || []).map(
              (course) => ({
                label: course.title,
                value: `${course.studentCount || 0} students`,
              }),
            )}
          />
          <AnalyticsList
            title="Category Distribution"
            items={(courseAnalytics?.categoryDistribution || []).map(
              (item) => ({
                label: item.category,
                value: item.count,
              }),
            )}
          />
          <AnalyticsList
            title="Level Distribution"
            items={(courseAnalytics?.levelDistribution || []).map((item) => ({
              label: item.level,
              value: item.count,
            }))}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Revenue Analytics
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Payment and revenue performance
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <AdminMiniCard
            label="Total Revenue"
            value={formatCurrency(revenueAnalytics?.totalRevenue)}
          />
          <AdminMiniCard
            label="Paid Orders"
            value={revenueAnalytics?.totalPaidOrders || 0}
          />
          <AdminMiniCard
            label="Average Order Value"
            value={formatCurrency(revenueAnalytics?.averageOrderValue)}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalyticsList
            title="Top Revenue Courses"
            items={(revenueAnalytics?.topRevenueCourses || []).map((item) => ({
              label: item.title,
              value: formatCurrency(item.revenue),
            }))}
          />
          <AnalyticsList
            title="Revenue Last 30 Days"
            items={(revenueAnalytics?.revenueLast30Days || [])
              .slice(-7)
              .map((item) => ({
                label: item.date,
                value: formatCurrency(item.revenue),
              }))}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Enrollment Analytics
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Student enrollment performance
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AdminMiniCard
            label="Total Enrollments"
            value={enrollmentAnalytics?.totalEnrollments || 0}
          />
          <AdminMiniCard
            label="Average Enrollments"
            value={enrollmentAnalytics?.averageEnrollments || 0}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalyticsList
            title="Top Enrollment Courses"
            items={(enrollmentAnalytics?.topCourses || []).map((course) => ({
              label: course.title,
              value: `${course.studentCount || 0} students`,
            }))}
          />
          <AnalyticsList
            title="Zero Enrollment Courses"
            items={(enrollmentAnalytics?.zeroEnrollmentCourses || []).map(
              (course) => ({
                label: course.title,
                value: course.status,
              }),
            )}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Quiz Analytics
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Quiz usage and performance
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <AdminMiniCard
            label="Total Quizzes"
            value={quizAnalytics?.totalQuizzes || 0}
          />
          <AdminMiniCard
            label="Published"
            value={quizAnalytics?.publishedQuizzes || 0}
          />
          <AdminMiniCard
            label="Attempts"
            value={quizAnalytics?.totalAttempts || 0}
          />
          <AdminMiniCard
            label="Pass Rate"
            value={`${quizAnalytics?.passRate || 0}%`}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalyticsList
            title="Top Attempted Quizzes"
            items={(quizAnalytics?.topAttemptedQuizzes || []).map((quiz) => ({
              label: quiz.title,
              value: `${quiz.attempts} attempts`,
            }))}
          />
          <AnalyticsList
            title="Quiz Summary"
            items={[
              {
                label: "Passed Attempts",
                value: quizAnalytics?.passedAttempts || 0,
              },
              {
                label: "Failed Attempts",
                value: quizAnalytics?.failedAttempts || 0,
              },
              {
                label: "Average Score",
                value: `${quizAnalytics?.averageScore || 0}%`,
              },
            ]}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Certificate Analytics
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Certificate issuing performance
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <AdminMiniCard
            label="Total Certificates"
            value={certificateAnalytics?.totalCertificates || 0}
          />
          <AdminMiniCard
            label="Active"
            value={certificateAnalytics?.activeCertificates || 0}
          />
          <AdminMiniCard
            label="Revoked"
            value={certificateAnalytics?.revokedCertificates || 0}
          />
        </div>

        <div className="mt-6">
          <AnalyticsList
            title="Top Certificate Courses"
            items={(certificateAnalytics?.topCertificateCourses || []).map(
              (course) => ({
                label: course.title,
                value: `${course.certificates} certificates`,
              }),
            )}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Platform Monitoring
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Latest platform activity
        </h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalyticsList
            title="Latest Users"
            items={(platformMonitoring?.latestUsers || []).map((user) => ({
              label: user.name,
              value: user.role,
            }))}
          />
          <AnalyticsList
            title="Latest Courses"
            items={(platformMonitoring?.latestCourses || []).map((course) => ({
              label: course.title,
              value: course.status,
            }))}
          />
          <AnalyticsList
            title="Latest Orders"
            items={(platformMonitoring?.latestOrders || []).map((order) => ({
              label: order.course?.title || "Course",
              value: formatCurrency(order.amount),
            }))}
          />
          <AnalyticsList
            title="Latest Quiz Attempts"
            items={(platformMonitoring?.latestQuizAttempts || []).map(
              (attempt) => ({
                label: attempt.quiz?.title || "Quiz",
                value: `${attempt.percentage || 0}%`,
              }),
            )}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Recent Users</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3 pr-4 font-medium">User</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 font-medium">Verified</th>
                  <th className="py-3 pr-4 font-medium">Change Role</th>
                  <th className="py-3 pr-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-5 text-center text-zinc-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-100">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-zinc-950">{item.name}</p>
                        <p className="text-xs text-zinc-500">{item.email}</p>
                      </td>

                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold capitalize text-zinc-700">
                          {item.role}
                        </span>
                      </td>

                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          disabled={updatingUserId === item._id}
                          onClick={() =>
                            handleVerificationChange(
                              item._id,
                              !item.isEmailVerified,
                            )
                          }
                          className={`rounded-md px-3 py-1 text-xs font-semibold ${
                            item.isEmailVerified
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.isEmailVerified ? "Verified" : "Unverified"}
                        </button>
                      </td>

                      <td className="py-3 pr-4">
                        <select
                          value={item.role}
                          disabled={updatingUserId === item._id}
                          onChange={(event) =>
                            handleRoleChange(item._id, event.target.value)
                          }
                          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:border-emerald-600"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          disabled={updatingUserId === item._id}
                          onClick={() => handleDeleteUser(item._id)}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:bg-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">
            Recent Courses
          </h2>

          <div className="mt-5 space-y-4">
            {courses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
                No courses found.
              </p>
            ) : (
              courses.map((course) => (
                <div
                  key={course._id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-zinc-950">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600">
                        Instructor: {course.instructor?.name || "Unknown"}
                      </p>
                      <p className="mt-1 text-xs capitalize text-zinc-500">
                        {course.category} • {course.level}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        course.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {course.status}
                    </span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={updatingCourseId === course._id}
                        onClick={() =>
                          handleCourseStatusChange(
                            course._id,
                            course.status === "published"
                              ? "draft"
                              : "published",
                          )
                        }
                        className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
                      >
                        {course.status === "published"
                          ? "Move to Draft"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        disabled={updatingCourseId === course._id}
                        onClick={() => handleDeleteCourse(course._id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:bg-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Recent Payments</h2>

        <div className="mt-5 space-y-4">
          {(dashboard?.recentOrders || []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
              No paid orders yet.
            </p>
          ) : (
            dashboard.recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-zinc-950">
                    {order.course?.title || "Course"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Paid by {order.user?.name || "User"} • {order.currency}
                  </p>
                </div>

                <span className="font-semibold text-emerald-700">
                  {formatCurrency(order.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function AdminMiniCard({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-stone-50 p-4">
      <p className="text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function AnalyticsList({ title, items = [] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-stone-50 p-4">
      <h3 className="font-semibold text-zinc-950">{title}</h3>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No data available.</p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="capitalize text-zinc-600">{item.label}</span>
              <span className="font-semibold text-zinc-950">{item.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
