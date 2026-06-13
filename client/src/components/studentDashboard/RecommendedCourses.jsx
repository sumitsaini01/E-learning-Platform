import { Link } from "react-router-dom";
import DashboardSection from "./DashboardSection";

function RecommendedCourses({ courses = [] }) {
  return (
    <DashboardSection
      title="Recommended Courses"
      description="Courses you may like based on your learning journey."
      action={
        <Link
          to="/courses"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View All Courses
        </Link>
      }
    >
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No recommendations available right now.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.slice(0, 3).map((course) => {
            const courseId = course._id || course.id;

            return (
              <div
                key={courseId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <span className="font-semibold">SkillSphere</span>
                  </div>
                )}

                <div className="p-5">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {course.category || "Course"}
                  </span>

                  <h3 className="mt-3 line-clamp-2 font-semibold text-slate-950 dark:text-white">
                    {course.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {course.description}
                  </p>

                  <Link
                    to={`/courses/${courseId}`}
                    className="mt-4 inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}

export default RecommendedCourses;
