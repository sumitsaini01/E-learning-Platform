function CourseCurriculum({
  sections = [],
  canViewAllLessons,
  completedLessons = [],
  getLessonWatchedPercent,
  handleOpenLesson,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
        Course Curriculum
      </h2>

      <div className="mt-6 space-y-5">
        {sections.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-slate-700 dark:text-slate-400">
            Curriculum has not been added yet.
          </p>
        ) : (
          sections.map((section, sectionIndex) => (
            <div
              key={section._id || sectionIndex}
              className="rounded-2xl border border-zinc-200 p-4 dark:border-slate-800"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Section {sectionIndex + 1}
              </p>

              <h3 className="mt-1 font-semibold text-zinc-950 dark:text-white">
                {section.title}
              </h3>

              <div className="mt-4 space-y-3">
                {section.lessons?.length ? (
                  section.lessons.map((lesson, lessonIndex) => {
                    const isLocked =
                      !canViewAllLessons && !lesson.isPreviewFree;

                    const isCompleted = completedLessons.includes(lesson._id);
                    const watchedPercent = getLessonWatchedPercent(lesson._id);

                    return (
                      <button
                        key={lesson._id || lessonIndex}
                        type="button"
                        onClick={() => handleOpenLesson(lesson, section)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isLocked
                            ? "border-zinc-200 bg-stone-50 dark:border-slate-800 dark:bg-slate-950"
                            : "border-zinc-200 bg-white hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-slate-500">
                              Lesson {lessonIndex + 1}
                            </p>

                            <h4 className="mt-1 font-medium text-zinc-950 dark:text-white">
                              {lesson.title}
                            </h4>

                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-slate-400">
                              <span>{lesson.duration || 0} min</span>

                              {watchedPercent > 0 && !isCompleted ? (
                                <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  {watchedPercent}% watched
                                </span>
                              ) : null}

                              {lesson.isPreviewFree ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Free Preview
                                </span>
                              ) : null}

                              {isCompleted ? (
                                <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  Completed
                                </span>
                              ) : null}

                              {isLocked ? (
                                <span className="rounded-full bg-zinc-200 px-2 py-1 font-medium text-zinc-700 dark:bg-slate-800 dark:text-slate-300">
                                  Locked
                                </span>
                              ) : null}
                            </div>

                            {watchedPercent > 0 ? (
                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                                <div
                                  className="h-full rounded-full bg-blue-600"
                                  style={{ width: `${watchedPercent}%` }}
                                />
                              </div>
                            ) : null}
                          </div>

                          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                            {isLocked ? "Enroll to unlock" : "Open"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="rounded-md bg-stone-50 p-3 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
                    No lessons added yet.
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CourseCurriculum;
