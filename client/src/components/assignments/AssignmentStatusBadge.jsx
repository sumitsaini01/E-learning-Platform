function AssignmentStatusBadge({ status = "pending" }) {
  const statusStyles = {
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",

    submitted:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",

    graded:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",

    overdue: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  };

  const labels = {
    pending: "Pending",
    submitted: "Submitted",
    graded: "Graded",
    overdue: "Overdue",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {labels[status] || "Pending"}
    </span>
  );
}

export default AssignmentStatusBadge;
