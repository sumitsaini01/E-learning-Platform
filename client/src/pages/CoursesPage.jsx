import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseGrid from "../components/CourseGrid";
import { getCourses } from "../services/courseService";

function CoursesPage() {
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const search = searchParams.get("search") || "";

  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);

      setError("");

      const data = await getCourses({
        limit: 50,
        search,
      });

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
  }, [search]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Courses
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Browse courses
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Explore all available courses.
        </p>

        {search ? (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Search results for: "{search}"
          </p>
        ) : null}
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