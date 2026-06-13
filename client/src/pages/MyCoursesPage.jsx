import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudentEnrolledCourses } from "../services/courseService";
import { getCourseProgress } from "../services/progressService";
import MyCourseCard from "../components/myCourses/MyCourseCard";
const getCourseId = (course) => course._id || course.id;

function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadMyCourses = async () => {
    try {
      setError("");

      const enrolledData = await getStudentEnrolledCourses();
      const enrolledCourses = enrolledData.courses || [];

      const progressResults = await Promise.allSettled(
        enrolledCourses.map((course) => getCourseProgress(getCourseId(course))),
      );

      const nextProgressMap = {};

      progressResults.forEach((result, index) => {
        const courseId = getCourseId(enrolledCourses[index]);

        if (result.status === "fulfilled") {
          nextProgressMap[courseId] = result.value;
        }
      });

      setCourses(enrolledCourses);
      setProgressMap(nextProgressMap);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyCourses();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-40 rounded bg-zinc-200" />
          <div className="mt-5 h-10 w-72 rounded bg-zinc-200" />
          <div className="mt-4 h-4 w-full rounded bg-zinc-200" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          My Courses
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
          Continue Your Learning
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          View all your enrolled courses and track your progress.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            My Learning
          </h2>

          <Link
            to="/courses"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Browse more courses
          </Link>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
                Start your learning journey
              </h3>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                You have not enrolled in any courses yet.
              </p>

              <Link
                to="/courses"
                className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            courses.map((course) => {
              const courseId = getCourseId(course);
              const courseProgress = progressMap[courseId];

              return (
                <MyCourseCard
                  key={courseId}
                  course={course}
                  percentage={courseProgress?.percentage || 0}
                  completed={courseProgress?.completed || 0}
                  totalLessons={courseProgress?.totalLessons || 0}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default MyCoursesPage;
