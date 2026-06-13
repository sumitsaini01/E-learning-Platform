function StatCard({ title, value, subtitle, icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900",
    emerald:
      "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900",
    orange:
      "bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900",
    purple:
      "bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>

        {icon}
      </div>

      <h3 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </h3>

      {subtitle ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default StatCard;
