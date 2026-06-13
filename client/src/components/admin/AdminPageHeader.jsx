function AdminPageHeader({
  badge = "Admin Panel",
  title,
  description,
  action,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {badge}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            {title}
          </h1>

          {description ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>

        {action}
      </div>
    </div>
  );
}

export default AdminPageHeader;
