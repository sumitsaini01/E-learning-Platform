import { useEffect, useState } from "react";
import {
  getAdminCourses,
  getAdminDashboard,
  getAdminUsers,
  updateUserRole,
} from "../services/adminService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState("");

  const loadAdminData = async () => {
    try {
      setError("");

      const [dashboardData, usersData, coursesData] = await Promise.all([
        getAdminDashboard(),
        getAdminUsers({ limit: 8 }),
        getAdminCourses({ limit: 8 }),
      ]);

      setDashboard(dashboardData);
      setUsers(usersData.users || []);
      setCourses(coursesData.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin dashboard.");
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Recent Users</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3 pr-4 font-medium">User</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 font-medium">Change Role</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-5 text-center text-zinc-500">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Recent Courses</h2>

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

export default AdminDashboardPage;