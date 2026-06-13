import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm dark:border-red-900 dark:bg-slate-900">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl dark:bg-red-950/40">
          🚫
        </div>

        <p className="text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-300">
          Access Denied
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          403 Unauthorized
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
          You do not have permission to access this page.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Go Home
          </Link>

          <Link
            to="/profile"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go To Profile
          </Link>
        </div>
      </div>
    </section>
  );
}

export default UnauthorizedPage;
