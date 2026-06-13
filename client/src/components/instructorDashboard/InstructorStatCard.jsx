function InstructorStatCard({
  title,
  value,
  subtitle = "",
  icon,
  color = "blue",
}) {
  const colorClasses = {
    blue: {
      container:
        "border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20",
      icon: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
    },
    emerald: {
      container:
        "border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20",
      icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
    amber: {
      container:
        "border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20",
      icon: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
    },
    purple: {
      container:
        "border-purple-100 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20",
      icon: "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300",
    },
    red: {
      container:
        "border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950/20",
      icon: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300",
    },
  };

  const styles = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${styles.container}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {value}
          </p>

          {subtitle ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>

        {icon ? (
          <div className={`rounded-2xl p-3 ${styles.icon}`}>{icon}</div>
        ) : null}
      </div>
    </div>
  );
}

export default InstructorStatCard;
