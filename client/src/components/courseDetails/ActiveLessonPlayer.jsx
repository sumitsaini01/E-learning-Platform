function ActiveLessonPlayer({
  activeLesson,
  activeLessonYoutubeEmbedUrl,
  videoRef,
  handleVideoTimeUpdate,
  handleVideoPauseOrEnded,
  canTrackProgress,
  activeLessonWatchedPercent,
  progressMessage,
  handleMarkComplete,
  isCompleting,
  isActiveLessonCompleted,
  nextLesson,
  handleOpenNextLesson,
  children,
}) {
  if (!activeLesson) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
        {activeLesson.sectionTitle}
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
        {activeLesson.title}
      </h2>

      {activeLesson.description ? (
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-slate-400">
          {activeLesson.description}
        </p>
      ) : null}

      {activeLesson.videoUrl ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-black dark:border-slate-800">
          {activeLessonYoutubeEmbedUrl ? (
            <iframe
              src={activeLessonYoutubeEmbedUrl}
              title={activeLesson.title}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={activeLesson.videoUrl}
              controls
              controlsList="nodownload"
              className="aspect-video w-full"
              onTimeUpdate={handleVideoTimeUpdate}
              onPause={handleVideoPauseOrEnded}
              onEnded={handleVideoPauseOrEnded}
            />
          )}
        </div>
      ) : (
        <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
          No video URL added for this lesson.
        </p>
      )}

      {canTrackProgress ? (
        <div className="mt-5">
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
              <span>Watch progress</span>
              <span>{activeLessonWatchedPercent}%</span>
            </div>

            <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${activeLessonWatchedPercent}%` }}
              />
            </div>
          </div>

          {progressMessage ? (
            <p className="mb-3 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-700 dark:bg-slate-800 dark:text-slate-300">
              {progressMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={isCompleting || isActiveLessonCompleted}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isActiveLessonCompleted
                ? "Completed"
                : isCompleting
                  ? "Marking..."
                  : "Mark as Complete"}
            </button>

            {nextLesson ? (
              <button
                type="button"
                onClick={handleOpenNextLesson}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next Lesson →
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}

export default ActiveLessonPlayer;
