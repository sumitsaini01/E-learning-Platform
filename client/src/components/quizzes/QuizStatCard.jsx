function QuizStatCard({ title, value, icon, color = "blue" }) {
  const colorClasses = {
    blue: {
      container:
        "border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20",
      icon: "text-blue-600 dark:text-blue-400",
    },

    emerald: {
      container:
        "border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20",
      icon: "text-emerald-600 dark:text-emerald-400",
    },

    red: {
      container:
        "border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950/20",
      icon: "text-red-600 dark:text-red-400",
    },

    amber: {
      container:
        "border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20",
      icon: "text-amber-600 dark:text-amber-400",
    },

    purple: {
      container:
        "border-purple-100 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20",
      icon: "text-purple-600 dark:text-purple-400",
    },

    slate: {
      container:
        "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
      icon: "text-slate-600 dark:text-slate-400",
    },
  };

  const styles = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${styles.container}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </p>

        <div className={styles.icon}>{icon}</div>
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default QuizStatCard;
