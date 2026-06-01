import CourseCard from "./CourseCard";

function CourseGrid({ courses, error, isLoading, onRetry }) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="min-h-80 animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="h-40 w-full bg-zinc-200" />

            <div className="p-5">
              <div className="h-5 w-24 rounded bg-zinc-200" />
              <div className="mt-6 h-6 w-3/4 rounded bg-zinc-200" />

              <div className="mt-4 space-y-2">
                <div className="h-4 rounded bg-zinc-200" />
                <div className="h-4 rounded bg-zinc-200" />
                <div className="h-4 w-2/3 rounded bg-zinc-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-800">{error}</p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">
          No courses found
        </h2>

        <p className="mt-2 text-sm text-zinc-600">
          New courses will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course._id || course.id} course={course} />
      ))}
    </div>
  );
}

export default CourseGrid;