import { useEffect, useState } from "react";

import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminRecentCourses from "../../components/admin/AdminRecentCourses";

import {
  deleteAdminCourse,
  getAdminCourses,
  updateAdminCourseStatus,
} from "../../services/adminService";

function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCourseId, setUpdatingCourseId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCourses = async () => {
    try {
      const data = await getAdminCourses();

      setCourses(data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleStatusChange = async (courseId, status) => {
    try {
      setUpdatingCourseId(courseId);

      const data = await updateAdminCourseStatus(courseId, status);

      setSuccess(data.message);

      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setUpdatingCourseId("");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      setUpdatingCourseId(courseId);

      const data = await deleteAdminCourse(courseId);

      setSuccess(data.message);

      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setUpdatingCourseId("");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        Loading courses...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        badge="Course Management"
        title="Manage Platform Courses"
        description="Review, publish, draft, and remove courses."
      />

      {error && (
        <div className="rounded-xl bg-red-100 p-3 text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </div>
      )}

      <AdminRecentCourses
        courses={courses}
        updatingCourseId={updatingCourseId}
        onStatusChange={handleStatusChange}
        onDeleteCourse={handleDeleteCourse}
      />
    </section>
  );
}

export default AdminCoursesPage;
