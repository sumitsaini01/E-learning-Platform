function AboutPage() {
  const stats = [
    {
      label: "Students",
      value: "1000+",
    },
    {
      label: "Courses",
      value: "100+",
    },
    {
      label: "Certificates Issued",
      value: "500+",
    },
    {
      label: "Learning Hours",
      value: "10,000+",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-16 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">About SkillSphere</h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-emerald-50">
          SkillSphere is a modern e-learning platform designed to help students
          learn practical skills, instructors share knowledge, and organizations
          build future-ready talent through interactive learning experiences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-3xl font-bold text-emerald-600">{item.value}</p>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Our Mission
          </h2>

          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
            Our mission is to make high-quality education accessible to
            everyone. We believe learning should be practical, affordable, and
            focused on real-world outcomes that help students grow
            professionally and personally.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Our Vision
          </h2>

          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
            We aim to become a trusted learning ecosystem where students,
            instructors, and industry experts collaborate to build skills, share
            knowledge, and create meaningful career opportunities.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
          Why Choose SkillSphere?
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold text-slate-950 dark:text-white">
              Expert Instructors
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Learn from experienced professionals and educators.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold text-slate-950 dark:text-white">
              Practical Learning
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Courses focused on real-world skills and projects.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold text-slate-950 dark:text-white">
              Certificates
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Earn verifiable certificates after course completion.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold text-slate-950 dark:text-white">
              Career Growth
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Prepare for interviews and improve job readiness.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
          What We Offer
        </h2>

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          <li className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950 dark:text-slate-300">
            Interactive video courses
          </li>

          <li className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950 dark:text-slate-300">
            AI-powered learning tools
          </li>

          <li className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950 dark:text-slate-300">
            Quizzes and assessments
          </li>

          <li className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950 dark:text-slate-300">
            Discussion forums and community learning
          </li>

          <li className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950 dark:text-slate-300">
            Learning progress tracking
          </li>

          <li className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950 dark:text-slate-300">
            Course completion certificates
          </li>
        </ul>
      </div>
    </section>
  );
}

export default AboutPage;
