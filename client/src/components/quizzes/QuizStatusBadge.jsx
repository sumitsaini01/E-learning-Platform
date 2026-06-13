function QuizStatusBadge({ passed, size = "sm" }) {
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${
        passed
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
      } ${sizes[size]}`}
    >
      {passed ? "Passed" : "Failed"}
    </span>
  );
}

export default QuizStatusBadge;
