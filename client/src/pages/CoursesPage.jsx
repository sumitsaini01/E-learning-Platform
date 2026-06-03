import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseGrid from "../components/CourseGrid";
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

      const params = {
        limit: 50,
        search,
        category,
        level,
        priceType,
        minRating,
        sort,
      };

      const data = await getCourses(params);

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
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Courses
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Browse courses
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Explore all available courses and filter by category, level, price,
          rating, and popularity.
        </p>

        {search ? (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Search results for: "{search}"
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Category
            </label>

            <select
              value={category}
              onChange={(event) => updateFilter("category", event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">All Categories</option>

              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Level
            </label>

            <select
              value={level}
              onChange={(event) => updateFilter("level", event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Price
            </label>

            <select
              value={priceType}
              onChange={(event) =>
                updateFilter("priceType", event.target.value)
              }
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Rating
            </label>

            <select
              value={minRating}
              onChange={(event) =>
                updateFilter("minRating", event.target.value)
              }
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Any Rating</option>
              <option value="4">4★ & above</option>
              <option value="3">3★ & above</option>
              <option value="2">2★ & above</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Sort By
            </label>

            <select
              value={sort}
              onChange={(event) => updateFilter("sort", event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="newest">Newest</option>
              <option value="highest-rated">Highest Rated</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price Low to High</option>
              <option value="price-high">Price High to Low</option>
            </select>
          </div>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            Clear Filters
          </button>
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
