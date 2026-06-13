function AIQuizGenerator({
  aiForm,
  setAiForm,
  isGeneratingAI = false,
  onGenerate,
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-bold text-slate-950 dark:text-white">
            AI Quiz Generator
          </h3>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Generate quiz questions using AI, then review and edit before
            saving.
          </p>
        </div>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          New
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px_160px]">
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Topic / Prompt
          </label>

          <input
            type="text"
            value={aiForm.topic}
            onChange={(event) =>
              setAiForm((current) => ({
                ...current,
                topic: event.target.value,
              }))
            }
            placeholder="Example: React Hooks, MongoDB Aggregation, DSA Arrays"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Difficulty
          </label>

          <select
            value={aiForm.difficulty}
            onChange={(event) =>
              setAiForm((current) => ({
                ...current,
                difficulty: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Questions
          </label>

          <input
            type="number"
            min="1"
            max="20"
            value={aiForm.questionCount}
            onChange={(event) =>
              setAiForm((current) => ({
                ...current,
                questionCount: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGeneratingAI}
        className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isGeneratingAI ? "Generating..." : "Generate Questions with AI"}
      </button>
    </div>
  );
}

export default AIQuizGenerator;
