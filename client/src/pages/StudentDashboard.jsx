import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getStudentEnrolledCourses } from "../services/courseService";
import {
  generateCertificate,
  getMyCertificates,
} from "../services/certificateService";
import { getCourseProgress } from "../services/progressService";
import { getMyQuizAttempts } from "../services/quizService";
import { getMyActivities } from "../services/activityService";

const getCourseId = (course) => course._id || course.id;

function StudentDashboard() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activities, setActivities] = useState([]);

  const [error, setError] = useState("");
  const [certificateMessage, setCertificateMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [generatingCourseId, setGeneratingCourseId] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const [enrolledData, attemptsData, certificatesData, activitiesData] =
        await Promise.all([
          getStudentEnrolledCourses(),
          getMyQuizAttempts(),
          getMyCertificates(),
          getMyActivities({ limit: 8 }),
        ]);

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
      setQuizAttempts(attemptsData.attempts || []);
      setCertificates(certificatesData.certificates || []);
      setActivities(activitiesData.activities || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load student dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let shouldUpdate = true;

    const run = async () => {
      if (shouldUpdate) {
        await loadDashboard();
      }
    };

    run();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const dashboardStats = useMemo(() => {
    const enrolledCourses = courses.length;

    const completedLessons = Object.values(progressMap).reduce(
      (total, item) => total + (item?.completed || 0),
      0,
    );

    const totalLessons = Object.values(progressMap).reduce(
      (total, item) => total + (item?.totalLessons || 0),
      0,
    );

    const completedCourses = courses.filter((course) => {
      const courseId = getCourseId(course);

      return (progressMap[courseId]?.percentage || 0) >= 100;
    }).length;

    const activeCourses = courses.filter((course) => {
      const courseId = getCourseId(course);

      const percentage = progressMap[courseId]?.percentage || 0;

      return percentage > 0 && percentage < 100;
    }).length;

    const averageProgress =
      enrolledCourses === 0
        ? 0
        : Math.round(
            courses.reduce((total, course) => {
              const courseId = getCourseId(course);

              return total + (progressMap[courseId]?.percentage || 0);
            }, 0) / enrolledCourses,
          );

    const totalQuizAttempts = quizAttempts.length;

    const passedQuizzes = quizAttempts.filter(
      (attempt) => attempt.passed,
    ).length;

    const failedQuizzes = totalQuizAttempts - passedQuizzes;

    const averageQuizScore =
      totalQuizAttempts === 0
        ? 0
        : Math.round(
            quizAttempts.reduce(
              (total, attempt) => total + (attempt.percentage || 0),
              0,
            ) / totalQuizAttempts,
          );

    return {
      enrolledCourses,
      completedLessons,
      totalLessons,
      completedCourses,
      activeCourses,
      averageProgress,
      totalQuizAttempts,
      passedQuizzes,
      failedQuizzes,
      averageQuizScore,
      certificatesEarned: certificates.length,
    };
  }, [courses, progressMap, quizAttempts, certificates]);

  const continueCourses = useMemo(() => {
    return courses
      .map((course) => {
        const courseId = getCourseId(course);

        const progress = progressMap[courseId];

        return {
          course,
          courseId,
          progress,
          percentage: progress?.percentage || 0,
        };
      })
      .filter((item) => item.percentage > 0 && item.percentage < 100)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [courses, progressMap]);

  const recentQuizAttempts = useMemo(() => {
    return quizAttempts.slice(0, 5);
  }, [quizAttempts]);

  const certificateCourseIds = useMemo(() => {
    return new Set(
      certificates
        .map((certificate) => certificate.course?._id || certificate.course)
        .filter(Boolean),
    );
  }, [certificates]);

  const completedCoursesWithoutCertificate = useMemo(() => {
    return courses.filter((course) => {
      const courseId = getCourseId(course);

      const percentage = progressMap[courseId]?.percentage || 0;

      return percentage >= 100 && !certificateCourseIds.has(courseId);
    });
  }, [courses, progressMap, certificateCourseIds]);

  const handleGenerateCertificate = async (courseId) => {
    try {
      setError("");
      setCertificateMessage("");
      setGeneratingCourseId(courseId);

      const data = await generateCertificate(courseId);

      setCertificateMessage(
        data.message || "Certificate generated successfully.",
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to generate certificate.",
      );
    } finally {
      setGeneratingCourseId("");
    }
  };

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
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Student Dashboard
        </p>

        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950">
              Welcome back, {user?.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Track your courses, certificates, quizzes, and learning progress.
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Explore Courses
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {certificateMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {certificateMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Enrolled Courses</p>

          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {dashboardStats.enrolledCourses}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Completed Lessons</p>

          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {dashboardStats.completedLessons}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            of {dashboardStats.totalLessons} lessons
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Average Progress</p>

          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {dashboardStats.averageProgress}%
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Quiz Average</p>

          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {dashboardStats.averageQuizScore}%
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {dashboardStats.passedQuizzes} passed •{" "}
            {dashboardStats.failedQuizzes} failed
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Certificates</p>

          <p className="mt-2 text-3xl font-semibold text-zinc-950">
            {dashboardStats.certificatesEarned}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Your latest learning actions.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {activities.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
              No activity yet.
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity._id}
                className="flex gap-4 rounded-xl border border-zinc-200 p-4"
              >
                <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />

                <div className="flex-1">
                  <p className="font-semibold text-zinc-950">
                    {activity.title}
                  </p>

                  {activity.message ? (
                    <p className="mt-1 text-sm text-zinc-600">
                      {activity.message}
                    </p>
                  ) : null}

                  {activity.course?.title ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      Course: {activity.course.title}
                    </p>
                  ) : null}

                  <p className="mt-2 text-xs text-zinc-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {completedCoursesWithoutCertificate.length > 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">
            Certificates Ready
          </h2>

          <div className="mt-5 space-y-3">
            {completedCoursesWithoutCertificate.map((course) => {
              const courseId = getCourseId(course);

              return (
                <div
                  key={courseId}
                  className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-zinc-950">
                      {course.title}
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">
                      You completed this course. Generate your certificate.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateCertificate(courseId)}
                    disabled={generatingCourseId === courseId}
                    className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:bg-emerald-400"
                  >
                    {generatingCourseId === courseId
                      ? "Generating..."
                      : "Generate Certificate"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {certificates.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">
            My Certificates
          </h2>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {certificates.map((certificate) => (
              <div
                key={certificate._id}
                className="rounded-xl border border-zinc-200 bg-stone-50 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Certificate
                </p>

                <h3 className="mt-2 font-semibold text-zinc-950">
                  {certificate.courseTitle}
                </h3>

                <p className="mt-2 text-sm text-zinc-600">
                  Issued to {certificate.studentName}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  ID: {certificate.certificateId}
                </p>

                <Link
                  to={`/certificates/verify/${certificate.certificateId}`}
                  className="mt-4 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Verify Certificate
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {continueCourses.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">
            Continue Learning
          </h2>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {continueCourses.map(
              ({ course, courseId, progress, percentage }) => (
                <div
                  key={courseId}
                  className="rounded-xl border border-zinc-200 bg-stone-50 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    In Progress
                  </p>

                  <h3 className="mt-2 line-clamp-2 font-semibold text-zinc-950">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-600">
                    {progress?.continueLesson?.lessonTitle
                      ? `Last lesson: ${progress.continueLesson.lessonTitle}`
                      : "Continue from your last activity"}
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Progress</span>

                      <span className="font-semibold text-emerald-700">
                        {percentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/courses/${courseId}`}
                    className="mt-5 inline-flex w-full justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Resume Course
                  </Link>
                </div>
              ),
            )}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">
          Recent Quiz Attempts
        </h2>

        <div className="mt-5 space-y-4">
          {recentQuizAttempts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
              No quiz attempts yet.
            </p>
          ) : (
            recentQuizAttempts.map((attempt) => (
              <div
                key={attempt._id}
                className="rounded-xl border border-zinc-200 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-950">
                        {attempt.quiz?.title || "Quiz"}
                      </h3>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          attempt.passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {attempt.passed ? "Passed" : "Failed"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-600">
                      Course: {attempt.course?.title || "Unknown course"}
                    </p>

                    <p className="mt-2 text-sm text-zinc-600">
                      Score: {attempt.score}/{attempt.totalPoints} •{" "}
                      {attempt.percentage}% • Attempt #{attempt.attemptNumber}
                    </p>
                  </div>

                  {attempt.course?._id ? (
                    <Link
                      to={`/courses/${attempt.course._id}`}
                      className="inline-flex justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      View Course
                    </Link>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
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
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <h3 className="text-lg font-semibold text-zinc-950">
                Start your learning journey
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
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

              const percentage = courseProgress?.percentage || 0;

              const completed = courseProgress?.completed || 0;

              const totalLessons = courseProgress?.totalLessons || 0;

              const isCompleted = percentage >= 100;

              return (
                <div
                  key={courseId}
                  className="rounded-xl border border-zinc-200 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-zinc-950">
                          {course.title}
                        </h3>

                        {isCompleted ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                            Completed
                          </span>
                        ) : percentage > 0 ? (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                            Not started
                          </span>
                        )}
                      </div>

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
                            className="h-full rounded-full bg-emerald-600 transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${courseId}`}
                      className="inline-flex justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      {percentage > 0 ? "Continue Learning" : "Start Course"}
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
        View Profile
      </Link>
    </section>
  );
}

export default StudentDashboard;
