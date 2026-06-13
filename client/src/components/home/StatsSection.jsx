function StatsSection({ stats = [] }) {
  const visibleStats = stats.slice(0, 4);

  if (visibleStats.length === 0) {
    return null;
  }

  return (
    <section className="bg-blue-600 py-10 dark:bg-blue-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {visibleStats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-blue-100">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
