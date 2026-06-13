import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseGrid from "../components/CourseGrid";
import CourseFilters from "../components/courses/CourseFilters";
import CoursesToolbar from "../components/courses/CoursesToolbar";
import { getCourses } from "../services/courseService";

const categoryOptions = [
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "Full Stack", value: "full stack" },
  { label: "Programming", value: "programming" },
  { label: "Data Science", value: "data science" },
  { label: "AI / ML", value: "ai/ml" },
  { label: "Cloud Computing", value: "cloud computing" },
  { label: "Cyber Security", value: "cyber security" },
  { label: "Design", value: "design" },
  { label: "Business", value: "business" },
];

function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const priceType = searchParams.get("priceType") || "";
  const minRating = searchParams.get("minRating") || "";
  const sort = searchParams.get("sort") || "newest";

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams();

    if (search) {
      nextParams.set("search", search);
    }

    setSearchParams(nextParams);
  };

  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getCourses({
        limit: 50,
        search,
        category,
        level,
        priceType,
        minRating,
        sort,
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
  }, [search, category, level, priceType, minRating, sort]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const hasFilters = Boolean(category || level || priceType || minRating);

  return (
    <section className="bg-slate-50 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <CourseFilters
            categoryOptions={categoryOptions}
            category={category}
            level={level}
            priceType={priceType}
            minRating={minRating}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            hasFilters={hasFilters}
          />

          <main>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Browse Courses
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                Browse Courses
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Explore all available courses and filter by category, level,
                price, rating, and popularity.
              </p>
            </div>

            <CoursesToolbar
              search={search}
              sort={sort}
              updateFilter={updateFilter}
            />

            <div className="mt-5 mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isLoading
                  ? "Loading courses..."
                  : `${courses.length} courses found`}
              </p>

              {search && (
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Search: "{search}"
                </p>
              )}
            </div>

            <CourseGrid
              courses={courses}
              error={error}
              isLoading={isLoading}
              onRetry={loadCourses}
            />
          </main>
        </div>
      </div>
    </section>
  );
}

export default CoursesPage;
