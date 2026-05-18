import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function InstructorDashboard() {
  const { user } = useAuth();

  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Instructor Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Manage your courses, review learner activity, and prepare new lessons from here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Published Courses</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">0</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Students</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">0</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Reviews</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">0</p>
        </div>
      </div>

      <Link
        to="/profile"
        className="inline-flex rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
      >
        View profile
      </Link>
    </section>
  );
}

export default InstructorDashboard;
