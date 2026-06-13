function AiFlashcards({
  canViewAllLessons,
  flashcards,
  flashcardsError,
  isGeneratingFlashcards,
  handleGenerateFlashcards,
  activeFlashcard,
  setActiveFlashcard,
  showFlashcardAnswer,
  setShowFlashcardAnswer,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
            AI Flashcards
          </h2>

          <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
            Generate flashcards automatically and revise important concepts
            faster.
          </p>
        </div>

        {canViewAllLessons ? (
          <button
            type="button"
            onClick={handleGenerateFlashcards}
            disabled={isGeneratingFlashcards}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isGeneratingFlashcards ? "Generating..." : "Generate Flashcards"}
          </button>
        ) : null}
      </div>

      {!canViewAllLessons ? (
        <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
          Enroll in this course to generate flashcards.
        </p>
      ) : null}

      {flashcardsError ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {flashcardsError}
        </div>
      ) : null}

      {flashcards?.length ? (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {flashcards.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setActiveFlashcard(index);
                  setShowFlashcardAnswer(false);
                }}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                  activeFlashcard === index
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                Card {index + 1}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 p-6 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Question
            </p>

            <h3 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">
              {flashcards[activeFlashcard]?.question}
            </h3>

            {showFlashcardAnswer ? (
              <div className="mt-6 rounded-xl bg-blue-50 p-5 dark:bg-blue-950/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Answer
                </p>

                <p className="mt-2 text-sm leading-7 text-zinc-700 dark:text-slate-300">
                  {flashcards[activeFlashcard]?.answer}
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowFlashcardAnswer((current) => !current)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {showFlashcardAnswer ? "Hide Answer" : "Show Answer"}
              </button>

              {activeFlashcard < flashcards.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFlashcard((current) => current + 1);
                    setShowFlashcardAnswer(false);
                  }}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Next Card →
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default AiFlashcards;
