function QuizProgressBar({
  percentage = 0,
  passed = false,
  height = "sm",
  showLabel = true,
}) {
  const heights = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const progressColor = passed ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Performance
          </span>

          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {percentage}%
          </span>
        </div>
      )}

      <div
        className={`overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${heights[height]}`}
      >
        <div
          className={`${progressColor} h-full rounded-full transition-all duration-500`}
          style={{
            width: `${Math.max(0, Math.min(100, percentage))}%`,
          }}
        />
      </div>
    </div>
  );
}

export default QuizProgressBar;
