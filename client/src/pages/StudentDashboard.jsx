import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getRecommendedCourses,
  getSavedCourses,
  getStudentEnrolledCourses,
} from "../services/courseService";
import {
  generateCertificate,
  getMyCertificates,
} from "../services/certificateService";
import { getCourseProgress } from "../services/progressService";
import { getMyQuizAttempts } from "../services/quizService";
import { getMyActivities } from "../services/activityService";
import StudentDashboardHero from "../components/studentDashboard/StudentDashboardHero";
import DashboardStats from "../components/studentDashboard/DashboardStats";
import RecentActivity from "../components/studentDashboard/RecentActivity";
import ContinueLearning from "../components/studentDashboard/ContinueLearning";
import RecentQuizAttempts from "../components/studentDashboard/RecentQuizAttempts";
import CertificatesReady from "../components/studentDashboard/CertificatesReady";
import DashboardCertificates from "../components/studentDashboard/DashboardCertificates";
import RecommendedCourses from "../components/studentDashboard/RecommendedCourses";
import SavedCourses from "../components/studentDashboard/SavedCourses";
import UpcomingAssignments from "../components/studentDashboard/UpcomingAssignments";
import UpcomingDeadlines from "../components/studentDashboard/UpcomingDeadlines";

const getCourseId = (course) => course._id || course.id;

function StudentDashboard() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [savedCourses, setSavedCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
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

      const [
        enrolledData,
        savedData,
        recommendedData,
        attemptsData,
        certificatesData,
        activitiesData,
      ] = await Promise.all([
        getStudentEnrolledCourses(),
        getSavedCourses(),
        getRecommendedCourses(),
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
      setSavedCourses(savedData.courses || []);
      setRecommendedCourses(recommendedData.courses || []);
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
      <StudentDashboardHero user={user} />

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

      <DashboardStats dashboardStats={dashboardStats} user={user} />

      <RecentActivity activities={activities} />

      {completedCoursesWithoutCertificate.length > 0 ? (
        <CertificatesReady
          completedCoursesWithoutCertificate={
            completedCoursesWithoutCertificate
          }
          getCourseId={getCourseId}
          generatingCourseId={generatingCourseId}
          handleGenerateCertificate={handleGenerateCertificate}
        />
      ) : null}

      {certificates.length > 0 ? (
        <DashboardCertificates certificates={certificates} />
      ) : null}

      {continueCourses.length > 0 ? (
        <ContinueLearning continueCourses={continueCourses} />
      ) : null}

      <RecentQuizAttempts recentQuizAttempts={recentQuizAttempts} />

      <UpcomingAssignments />

      <UpcomingDeadlines />

      <RecommendedCourses courses={recommendedCourses} />

      <SavedCourses courses={savedCourses} />

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
