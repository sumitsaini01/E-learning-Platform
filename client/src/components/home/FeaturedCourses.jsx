import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import CourseCard from "../ui/CourseCard";

function FeaturedCourses({ courses = [], isLoading = false }) {
  const visibleCourses = courses.slice(0, 3);

  return (
    <section className="bg-white pt-10 pb-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Courses"
          title="Start Learning With Popular Courses"
          description="Explore career-focused courses designed to help students build real skills through lessons, quizzes, projects, and certificates."
        />

        {isLoading ? (
          <div className="mt-8 sm:mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[420px] animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900"
              />
            ))}
          </div>
        ) : visibleCourses.length > 0 ? (
          <div className="mt-8 sm:mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-8 sm:mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-400">
              No featured courses available yet.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/courses"
            className="inline-flex rounded-full border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCourses;
