function QuizRulesForm({ formData, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="font-bold text-slate-950 dark:text-white">Quiz Rules</h3>

      <div className="mt-4 grid gap-5 sm:grid-cols-3">
        <QuizNumberField
          label="Passing Percentage"
          value={formData.passingPercentage}
          min="0"
          max="100"
          helper="Example: 60 means student needs 60%."
          onChange={(value) => onChange("passingPercentage", value)}
        />

        <QuizNumberField
          label="Time Limit"
          value={formData.timeLimitMinutes}
          min="0"
          helper="Minutes. Use 0 for no limit."
          onChange={(value) => onChange("timeLimitMinutes", value)}
        />

        <QuizNumberField
          label="Max Attempts"
          value={formData.maxAttempts}
          min="0"
          helper="Use 0 for unlimited attempts."
          onChange={(value) => onChange("maxAttempts", value)}
        />
      </div>
    </div>
  );
}

function QuizNumberField({ label, value, onChange, min = "0", max, helper }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </label>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
      />

      {helper ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export default QuizRulesForm;
