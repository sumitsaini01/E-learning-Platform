function AiStudyNotes({
  canViewAllLessons,
  studyNotes,
  studyNotesError,
  isGeneratingNotes,
  handleGenerateStudyNotes,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
            AI Study Notes
          </h2>

          <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
            Generate quick revision notes, key points, terms, and practice
            questions.
          </p>
        </div>

        {canViewAllLessons ? (
          <button
            type="button"
            onClick={handleGenerateStudyNotes}
            disabled={isGeneratingNotes}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isGeneratingNotes ? "Generating..." : "Generate Notes with AI"}
          </button>
        ) : null}
      </div>

      {!canViewAllLessons ? (
        <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
          Enroll in this course to generate AI study notes.
        </p>
      ) : null}

      {studyNotesError ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {studyNotesError}
        </div>
      ) : null}

      {studyNotes ? (
        <div className="mt-6 space-y-5">
          {studyNotes.summary ? (
            <StudyNoteBlock title="Summary" variant="blue">
              <p className="whitespace-pre-line text-sm leading-6 text-zinc-700 dark:text-slate-300">
                {studyNotes.summary}
              </p>
            </StudyNoteBlock>
          ) : null}

          {studyNotes.keyPoints?.length ? (
            <StudyNoteBlock title="Key Points">
              <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-slate-300">
                {studyNotes.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </StudyNoteBlock>
          ) : null}

          {studyNotes.importantTerms?.length ? (
            <StudyNoteBlock title="Important Terms">
              <div className="grid gap-3 sm:grid-cols-2">
                {studyNotes.importantTerms.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-stone-50 p-4 dark:bg-slate-950"
                  >
                    <p className="font-semibold text-zinc-950 dark:text-white">
                      {item.term}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-slate-400">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </StudyNoteBlock>
          ) : null}

          {studyNotes.revisionChecklist?.length ? (
            <StudyNoteBlock title="Revision Checklist">
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-slate-300">
                {studyNotes.revisionChecklist.map((item, index) => (
                  <li key={index}>✅ {item}</li>
                ))}
              </ul>
            </StudyNoteBlock>
          ) : null}

          {studyNotes.practiceQuestions?.length ? (
            <StudyNoteBlock title="Practice Questions">
              <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-slate-300">
                {studyNotes.practiceQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ol>
            </StudyNoteBlock>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StudyNoteBlock({ title, children, variant = "default" }) {
  const variantClass =
    variant === "blue"
      ? "border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
      : "border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-950";

  return (
    <div className={`rounded-xl border p-5 ${variantClass}`}>
      <h3 className="font-semibold text-zinc-950 dark:text-white">{title}</h3>

      <div className="mt-3">{children}</div>
    </div>
  );
}

export default AiStudyNotes;
