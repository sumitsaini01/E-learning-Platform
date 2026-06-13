function CourseHero({
  course,
  studentCount,
  continueLesson,
  canTrackProgress,
  openLessonById,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {course.category || "General"}
        </span>

        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-slate-800 dark:text-slate-300">
          {studentCount} enrolled
        </span>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
          {course.level || "beginner"}
        </span>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          ★ {(course.averageRating || 0).toFixed(1)} ({course.numReviews || 0})
        </span>
      </div>

      <h1 className="mt-5 text-3xl font-semibold leading-tight text-zinc-950 dark:text-white sm:text-4xl">
        {course.title}
      </h1>

      <p className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-600 dark:text-slate-400">
        {course.description || "No course description available."}
      </p>

      {continueLesson?.lessonId && canTrackProgress ? (
        <button
          type="button"
          onClick={() => openLessonById(continueLesson.lessonId)}
          className="mt-5 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Continue Watching: {continueLesson.lessonTitle}
        </button>
      ) : null}
    </div>
  );
}

export default CourseHero;
