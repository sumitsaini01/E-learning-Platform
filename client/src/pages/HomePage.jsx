function HomePage() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="space-y-5">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          E-Learning Platform
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
          Learn, teach, and manage courses from one simple workspace.
        </h1>
        <p className="max-w-xl text-base leading-7 text-zinc-600">
          A clean foundation for courses, authentication screens, and future dashboards.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">Frontend foundation</h2>
        <div className="mt-5 grid gap-3 text-sm text-zinc-600">
          <p className="rounded-md bg-stone-50 p-3">React Router DOM configured</p>
          <p className="rounded-md bg-stone-50 p-3">Reusable layout and navbar added</p>
          <p className="rounded-md bg-stone-50 p-3">Pages ready for future auth flows</p>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
