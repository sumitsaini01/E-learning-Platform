import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getStudentEnrolledCourses } from "../services/courseService";
import { getCourseProgress } from "../services/progressService";

function StudentDashboard() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let shouldUpdate = true;

    const loadDashboard = async () => {
      try {
        setError("");

        const enrolledData = await getStudentEnrolledCourses();
        const enrolledCourses = enrolledData.courses || [];

        const progressResults = await Promise.allSettled(
          enrolledCourses.map((course) =>
            getCourseProgress(course._id || course.id),
          ),
        );

        const nextProgressMap = {};

        progressResults.forEach((result, index) => {
          const courseId = enrolledCourses[index]._id || enrolledCourses[index].id;

          if (result.status === "fulfilled") {
            nextProgressMap[courseId] = result.value;
          }
        });

        if (!shouldUpdate) return;

        setCourses(enrolledCourses);
        setProgressMap(nextProgressMap);
      } catch (err) {
        if (!shouldUpdate) return;

        setError(
          err.response?.data?.message || "Unable to load student dashboard.",
        );
      } finally {
        if (shouldUpdate) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const enrolledCoursesCount = courses.length;

  const completedLessonsCount = useMemo(() => {
    return Object.values(progressMap).reduce((total, item) => {
      return total + (item?.completed || 0);
    }, 0);
  }, [progressMap]);

  const averageProgress = useMemo(() => {
    if (courses.length === 0) return 0;

    const totalProgress = courses.reduce((total, course) => {
      const courseId = course._id || course.id;
      return total + (progressMap[courseId]?.percentage || 0);
    }, 0);

    return Math.round(totalProgress / courses.length);
  }, [courses, progressMap]);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-40 rounded bg-zinc-200" />
          <div className="mt-5 h-10 w-72 rounded bg-zinc-200" />
          <div className="mt-4 h-4 w-full rounded bg-zinc-200" />
          <div className="mt-2 h-4 w-3/4 rounded bg-zinc-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-zinc-200" />
              <div className="mt-4 h-8 w-16 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Student Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Welcome back, {user?.name}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Track your enrolled courses, continue lessons, and monitor your learning progress.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Enrolled Courses</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {enrolledCoursesCount}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Completed Lessons</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {completedLessonsCount}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Average Progress</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {averageProgress}%
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">My Learning</h2>

          <Link
            to="/courses"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Browse more courses
          </Link>
        </div>

        <div className="mt-5 space-y-4">
          {courses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center">
              <p className="text-sm text-zinc-600">
                You have not enrolled in any courses yet.
              </p>

              <Link
                to="/courses"
                className="mt-4 inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            courses.map((course) => {
              const courseId = course._id || course.id;
              const courseProgress = progressMap[courseId];
              const percentage = courseProgress?.percentage || 0;
              const completed = courseProgress?.completed || 0;
              const totalLessons = courseProgress?.totalLessons || 0;

              return (
                <div
                  key={courseId}
                  className="rounded-lg border border-zinc-200 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-950">
                        {course.title}
                      </h3>

                      <p className="mt-2 text-sm capitalize text-zinc-600">
                        {course.category} • {course.level}
                      </p>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">
                        {course.description}
                      </p>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-600">
                            {completed} of {totalLessons} lessons completed
                          </span>

                          <span className="font-semibold text-emerald-700">
                            {percentage}%
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${courseId}`}
                      className="inline-flex justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Link
        to="/profile"
        className="inline-flex rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
      >
        View profile
      </Link>
    </section>
  );
}

export default StudentDashboard;