function AdminStatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

        {Icon ? (
          <Icon size={20} className="text-emerald-600 dark:text-emerald-400" />
        ) : null}
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>

      {subtitle ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default AdminStatCard;
