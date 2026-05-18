import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
          🚫
        </div>

        <h1 className="text-3xl font-bold text-zinc-950">
          403 Unauthorized
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-600">
          You do not have permission to access this page.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Go Home
          </Link>

          <Link
            to="/profile"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
          >
            Go To Profile
          </Link>
        </div>
      </div>
    </section>
  );
}

export default UnauthorizedPage;