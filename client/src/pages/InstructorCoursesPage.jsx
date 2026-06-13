import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

import {
  deleteCourse,
  getInstructorCourses,
  publishCourse,
  unpublishCourse,
} from "../services/courseService";

import InstructorCourseSections from "../components/instructorDashboard/InstructorCourseSections";

const getCourseId = (course) => course._id || course.id;

function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const loadCourses = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getInstructorCourses();

      setCourses(data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
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

      setCourses((current) =>
        current.map((course) =>
          getCourseId(course) === courseId
            ? { ...course, status: "published" }
            : course,
        ),
      );

      setSuccessMessage(data.message || "Course published successfully.");
      await loadCourses();
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

      setCourses((current) =>
        current.map((course) =>
          getCourseId(course) === courseId
            ? { ...course, status: "draft" }
            : course,
        ),
      );

      setSuccessMessage(data.message || "Course moved to draft.");
      await loadCourses();
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

    if (!confirmed) return;

    try {
      setActionLoadingId(courseId);
      setError("");
      setSuccessMessage("");

      const data = await deleteCourse(courseId);

      setCourses((current) =>
        current.filter((course) => getCourseId(course) !== courseId),
      );

      setSuccessMessage(data.message || "Course deleted successfully.");
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete course.");
    } finally {
      setActionLoadingId("");
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-52 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-10 w-72 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Instructor Courses
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
              Manage Courses
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Create, publish, edit, and manage your SkillSphere courses.
            </p>
          </div>

          <Link
            to="/instructor/create-course"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <PlusCircle size={18} />
            Create Course
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <InstructorCourseSections
        publishedCourses={publishedCourses}
        draftCourses={draftCourses}
        actionLoadingId={actionLoadingId}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDelete={handleDelete}
      />
    </section>
  );
}

export default InstructorCoursesPage;
