import { Link } from "react-router-dom";

function StudentDashboardHero({ user }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 p-8 text-white shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-blue-100">
            Student Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Welcome back, {user?.name}
          </h1>

          <p className="mt-4 max-w-2xl text-blue-100">
            Continue your learning journey, track your progress, earn
            certificates, and achieve your goals.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/my-courses"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Continue Learning
          </Link>

          <Link
            to="/courses"
            className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Explore Courses
          </Link>
        </div>
      </div>
    </section>
  );
}

export default StudentDashboardHero;
