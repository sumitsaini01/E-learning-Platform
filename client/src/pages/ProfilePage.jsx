import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRoleRedirectPath } from "../utils/getRoleRedirectPath";

function ProfilePage() {
  const { user } = useAuth();

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">{user?.name}</h1>
            <p className="mt-2 text-sm text-zinc-600">{user?.email}</p>
          </div>

          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium capitalize text-emerald-800">
            {user?.role}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-zinc-200 bg-stone-50 p-4">
            <p className="text-sm text-zinc-500">User ID</p>
            <p className="mt-1 break-all text-sm font-medium text-zinc-900">{user?.id || user?._id}</p>
          </div>

          <div className="rounded-md border border-zinc-200 bg-stone-50 p-4">
            <p className="text-sm text-zinc-500">Account Type</p>
            <p className="mt-1 text-sm font-medium capitalize text-zinc-900">{user?.role}</p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            to={getRoleRedirectPath(user?.role)}
            className="inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
