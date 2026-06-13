function AdminRecentUsers({
  users = [],
  updatingUserId = "",
  onRoleChange,
  onVerificationChange,
  onDeleteUser,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">
        Recent Users
      </h2>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-3 pr-4 font-medium">User</th>
              <th className="py-3 pr-4 font-medium">Role</th>
              <th className="py-3 pr-4 font-medium">Verified</th>
              <th className="py-3 pr-4 font-medium">Change Role</th>
              <th className="py-3 pr-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-5 text-center text-slate-500 dark:text-slate-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-950 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.email}
                    </p>
                  </td>

                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {item.role}
                    </span>
                  </td>

                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      disabled={updatingUserId === item._id}
                      onClick={() =>
                        onVerificationChange?.(item._id, !item.isEmailVerified)
                      }
                      className={`rounded-md px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                        item.isEmailVerified
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {item.isEmailVerified ? "Verified" : "Unverified"}
                    </button>
                  </td>

                  <td className="py-3 pr-4">
                    <select
                      value={item.role}
                      disabled={updatingUserId === item._id}
                      onChange={(event) =>
                        onRoleChange?.(item._id, event.target.value)
                      }
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      disabled={updatingUserId === item._id}
                      onClick={() => onDeleteUser?.(item._id)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminRecentUsers;
