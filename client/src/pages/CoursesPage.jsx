import { useCallback, useEffect, useState } from "react";
import CourseGrid from "../components/CourseGrid";
import { getCourses } from "../services/courseService";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getCourses({ limit: 50 });

      setCourses(data.courses || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load courses right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Courses
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Browse courses
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            Explore available courses and open any course to view details.
          </p>
        </div>
      </div>

      <CourseGrid
        courses={courses}
        error={error}
        isLoading={isLoading}
        onRetry={loadCourses}
      />
    </section>
  );
}

export default CoursesPage;