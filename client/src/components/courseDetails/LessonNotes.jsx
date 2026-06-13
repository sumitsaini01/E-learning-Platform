function LessonNotes({
  lessonNote,
  noteForm,
  setNoteForm,
  noteMessage,
  noteError,
  isSavingNote,
  handleSaveLessonNote,
  handleDeleteLessonNote,
}) {
  return (
    <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
            My Lesson Notes
          </h3>

          <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
            Save your personal notes for this lesson.
          </p>
        </div>

        {lessonNote ? (
          <button
            type="button"
            onClick={handleDeleteLessonNote}
            disabled={isSavingNote}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-red-300"
          >
            Delete Note
          </button>
        ) : null}
      </div>

      {noteMessage ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {noteMessage}
        </div>
      ) : null}

      {noteError ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {noteError}
        </div>
      ) : null}

      <form onSubmit={handleSaveLessonNote} className="mt-5 space-y-4">
        <input
          type="text"
          value={noteForm.title}
          onChange={(event) =>
            setNoteForm((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          placeholder="Note title, optional"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
        />

        <textarea
          value={noteForm.content}
          onChange={(event) =>
            setNoteForm((current) => ({
              ...current,
              content: event.target.value,
            }))
          }
          placeholder="Write your lesson notes here..."
          className="min-h-36 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
        />

        <button
          type="submit"
          disabled={isSavingNote || !noteForm.content.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isSavingNote
            ? "Saving..."
            : lessonNote
              ? "Update Note"
              : "Save Note"}
        </button>
      </form>
    </div>
  );
}

export default LessonNotes;
