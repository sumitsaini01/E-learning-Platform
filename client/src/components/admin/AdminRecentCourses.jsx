function AdminRecentCourses({
  courses = [],
  updatingCourseId = "",
  onStatusChange,
  onDeleteCourse,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">
        Recent Courses
      </h2>

      <div className="mt-5 space-y-4">
        {courses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No courses found.
          </p>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">
                    {course.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Instructor: {course.instructor?.name || "Unknown"}
                  </p>

                  <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">
                    {course.category} • {course.level}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                    course.status === "published"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  {course.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updatingCourseId === course._id}
                  onClick={() =>
                    onStatusChange?.(
                      course._id,
                      course.status === "published" ? "draft" : "published",
                    )
                  }
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {course.status === "published" ? "Move to Draft" : "Publish"}
                </button>

                <button
                  type="button"
                  disabled={updatingCourseId === course._id}
                  onClick={() => onDeleteCourse?.(course._id)}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminRecentCourses;
