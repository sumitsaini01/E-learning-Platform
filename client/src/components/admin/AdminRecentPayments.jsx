const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function AdminRecentPayments({ orders = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">
        Recent Payments
      </h2>

      <div className="mt-5 space-y-4">
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No paid orders yet.
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">
                  {order.course?.title || "Course"}
                </p>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Paid by {order.user?.name || "User"} • {order.currency}
                </p>
              </div>

              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(order.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminRecentPayments;
