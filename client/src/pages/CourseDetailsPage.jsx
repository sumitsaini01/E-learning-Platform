import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { enrollInCourse, getCourseById } from "../services/courseService";

const formatPrice = (price) =>
  Number(price) === 0
    ? "Free"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(price || 0));

function CourseDetailsPage() {
  const { id } = useParams();
  const location = useLocation();

  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);

  const [error, setError] = useState("");

  const [enrollError, setEnrollError] = useState("");
  const [enrollMessage, setEnrollMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const loadCourse = async () => {
    try {
      setIsLoading(true);

      setError("");
      setEnrollError("");
      setEnrollMessage("");

      const data = await getCourseById(id);

      setCourse(data.course);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load course details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrollError("");
      setEnrollMessage("");

      setIsEnrolling(true);

      const data = await enrollInCourse(id);

      if (data.course) {
        setCourse(data.course);
      }

      setEnrollMessage(
        data.message || "Successfully enrolled in this course."
      );
    } catch (err) {
      setEnrollError(
        err.response?.data?.message ||
          "Unable to enroll in this course."
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-28 rounded bg-zinc-200" />

          <div className="mt-6 h-10 w-3/4 rounded bg-zinc-200" />

          <div className="mt-5 space-y-3">
            <div className="h-4 rounded bg-zinc-200" />
            <div className="h-4 rounded bg-zinc-200" />
            <div className="h-4 w-2/3 rounded bg-zinc-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-800">
          {error}
        </p>

        <button
          type="button"
          onClick={loadCourse}
          className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">
          Course not found
        </h2>

        <p className="mt-2 text-sm text-zinc-600">
          This course may have been removed or does not exist.
        </p>

        <Link
          to="/courses"
          className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Browse courses
        </Link>
      </section>
    );
  }

  const instructorName =
    course.instructor?.name || "SkillSphere Instructor";

  const instructorEmail = course.instructor?.email;

  const canEnroll =
    isAuthenticated && user?.role === "student";

  const studentCount = course.students?.length || 0;

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {course.category || "General"}
          </span>

          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
            {studentCount} enrolled
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
          {course.title}
        </h1>

        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-600">
          {course.description || "No course description available."}
        </p>
      </div>

      <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">
          Price
        </p>

        <p className="mt-1 text-3xl font-semibold text-zinc-950">
          {formatPrice(course.price)}
        </p>

        <div className="mt-6 border-t border-zinc-100 pt-5">
          <p className="text-sm text-zinc-500">
            Instructor
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-950">
            {instructorName}
          </p>

          {instructorEmail ? (
            <p className="mt-1 text-sm text-zinc-600">
              {instructorEmail}
            </p>
          ) : null}
        </div>

        {enrollMessage ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {enrollMessage}
          </div>
        ) : null}

        {enrollError ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {enrollError}
          </div>
        ) : null}

        {canEnroll ? (
          <button
            type="button"
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isEnrolling ? "Enrolling..." : "Enroll now"}
          </button>
        ) : !isAuthenticated ? (
          <Link
            to="/login"
            state={{ from: location }}
            className="mt-6 inline-flex w-full justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Login as student to enroll
          </Link>
        ) : (
          <p className="mt-6 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600">
            Only student accounts can enroll in courses.
          </p>
        )}
      </aside>
    </section>
  );
}

export default CourseDetailsPage;