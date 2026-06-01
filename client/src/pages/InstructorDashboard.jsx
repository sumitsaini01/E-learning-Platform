import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  deleteCourse,
  getInstructorAnalytics,
  getInstructorCourses,
  publishCourse,
  unpublishCourse,
} from "../services/courseService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function InstructorDashboard() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [actionLoadingId, setActionLoadingId] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const [coursesData, analyticsData] = await Promise.all([
        getInstructorCourses(),
        getInstructorAnalytics(),
      ]);

      setCourses(coursesData.courses || []);
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

  const publishedCourses = useMemo(
    () => courses.filter((course) => course.status === "published"),
    [courses],
  );

  const draftCourses = useMemo(
    () => courses.filter((course) => course.status === "draft"),
    [courses],
  );

  const handlePublish = async (courseId) => {
    try {
      setActionLoadingId(courseId);
      setError("");
      setSuccessMessage("");

      const data = await publishCourse(courseId);

      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                status: "published",
              }
            : course,
        ),
      );

      setSuccessMessage(data.message || "Course published successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to publish course.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleUnpublish = async (courseId) => {
    try {
      setActionLoadingId(courseId);
      setError("");
      setSuccessMessage("");

      const data = await unpublishCourse(courseId);

      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                status: "draft",
              }
            : course,
        ),
      );

      setSuccessMessage(data.message || "Course moved to draft.");
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to move course to draft.",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(courseId);
      setError("");
      setSuccessMessage("");

      const data = await deleteCourse(courseId);

      setCourses((currentCourses) =>
        currentCourses.filter((course) => course.id !== courseId),
      );

      setSuccessMessage(data.message || "Course deleted successfully.");

      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete course.");
    } finally {
      setActionLoadingId("");
    }
  };

  const renderCourseCard = (course) => {
    const isActionLoading = actionLoadingId === course.id;

    return (
      <div key={course.id} className="rounded-lg border border-zinc-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-zinc-950">{course.title}</h3>

            <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-600">
              <span>₹{course.price}</span>

              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                {course.category}
              </span>

              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium capitalize text-blue-700">
                {course.level}
              </span>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              course.status === "published"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {course.status}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600">
          <span>{course.students} students</span>

          <span>{course.numReviews} reviews</span>

          <span>{(course.averageRating || 0).toFixed(1)} rating</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to={`/instructor/courses/${course.id}/edit`}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Edit
          </Link>

          {course.status === "draft" ? (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => handlePublish(course.id)}
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isActionLoading ? "Publishing..." : "Publish"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => handleUnpublish(course.id)}
              className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {isActionLoading ? "Updating..." : "Move to Draft"}
            </button>
          )}

          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => handleDelete(course.id)}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isActionLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-40 rounded bg-zinc-200" />
          <div className="mt-5 h-10 w-72 rounded bg-zinc-200" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Instructor Dashboard
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950">
              Welcome back, {user?.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Manage your courses and student enrollments.
            </p>
          </div>

          <Link
            to="/instructor/create-course"
            className="inline-flex justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Create Course
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Courses</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {analytics?.summary?.totalCourses || 0}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {analytics?.summary?.publishedCourses || 0} published •{" "}
            {analytics?.summary?.draftCourses || 0} draft
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Students</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {analytics?.summary?.totalStudents || 0}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {formatCurrency(analytics?.summary?.totalRevenue)}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Average Rating</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {(analytics?.summary?.averageRating || 0).toFixed(1)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {analytics?.summary?.totalReviews || 0} reviews
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">
            Top Performing Course
          </h2>

          {analytics?.topCourse ? (
            <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5">
              <h3 className="font-semibold text-zinc-950">
                {analytics.topCourse.title}
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="text-sm text-zinc-600">
                  Students:{" "}
                  <span className="font-semibold text-zinc-950">
                    {analytics.topCourse.students}
                  </span>
                </p>

                <p className="text-sm text-zinc-600">
                  Revenue:{" "}
                  <span className="font-semibold text-zinc-950">
                    {formatCurrency(analytics.topCourse.revenue)}
                  </span>
                </p>

                <p className="text-sm text-zinc-600">
                  Rating:{" "}
                  <span className="font-semibold text-zinc-950">
                    {(analytics.topCourse.averageRating || 0).toFixed(1)}
                  </span>
                </p>

                <p className="text-sm text-zinc-600">
                  Reviews:{" "}
                  <span className="font-semibold text-zinc-950">
                    {analytics.topCourse.numReviews}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-zinc-600">
              No course performance data yet.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">
            Quiz Analytics
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-sm text-zinc-500">Total Attempts</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">
                {analytics?.quizAnalytics?.totalAttempts || 0}
              </p>
            </div>

            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-sm text-zinc-500">Average Score</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">
                {analytics?.quizAnalytics?.averageScore || 0}%
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Passed</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">
                {analytics?.quizAnalytics?.passedAttempts || 0}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">Failed</p>
              <p className="mt-2 text-2xl font-semibold text-red-900">
                {analytics?.quizAnalytics?.failedAttempts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">
          Course Performance
        </h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3 pr-4 font-medium">Course</th>
                <th className="py-3 pr-4 font-medium">Students</th>
                <th className="py-3 pr-4 font-medium">Revenue</th>
                <th className="py-3 pr-4 font-medium">Rating</th>
                <th className="py-3 pr-4 font-medium">Quiz Attempts</th>
                <th className="py-3 pr-4 font-medium">Pass Rate</th>
                <th className="py-3 pr-4 font-medium">Avg Score</th>
              </tr>
            </thead>

            <tbody>
              {(analytics?.coursePerformance || []).length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-5 text-center text-zinc-500">
                    No course performance data yet.
                  </td>
                </tr>
              ) : (
                analytics.coursePerformance.map((course) => (
                  <tr key={course.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-medium text-zinc-950">
                      {course.title}
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">
                      {course.students}
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">
                      {formatCurrency(course.revenue)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">
                      {(course.averageRating || 0).toFixed(1)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">
                      {course.quizAttempts}
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">
                      {course.quizPassRate}%
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">
                      {course.averageQuizScore}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">
          Recent Quiz Attempts
        </h2>

        <div className="mt-5 space-y-3">
          {(analytics?.recentQuizAttempts || []).length === 0 ? (
            <p className="text-sm text-zinc-600">No quiz attempts yet.</p>
          ) : (
            analytics.recentQuizAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-zinc-950">
                    {attempt.quizTitle}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {attempt.courseTitle} • {attempt.percentage}% •{" "}
                    {attempt.passed ? "Passed" : "Failed"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    attempt.passed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {attempt.passed ? "Passed" : "Failed"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">
            Published Courses
          </h2>

          <div className="mt-5 space-y-4">
            {publishedCourses.length === 0 ? (
              <p className="text-sm text-zinc-600">No published courses yet.</p>
            ) : (
              publishedCourses.map(renderCourseCard)
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Draft Courses</h2>

          <div className="mt-5 space-y-4">
            {draftCourses.length === 0 ? (
              <p className="text-sm text-zinc-600">
                No draft courses available.
              </p>
            ) : (
              draftCourses.map(renderCourseCard)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default InstructorDashboard;
