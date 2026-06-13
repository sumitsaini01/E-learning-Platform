import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";

function AssignmentsStats({ assignments = [] }) {
  const total = assignments.length;

  const pending = assignments.filter(
    (assignment) => assignment.status === "pending",
  ).length;

  const submitted = assignments.filter(
    (assignment) => assignment.status === "submitted",
  ).length;

  const graded = assignments.filter(
    (assignment) => assignment.status === "graded",
  ).length;

  const overdue = assignments.filter(
    (assignment) => assignment.status === "overdue",
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Total"
        value={total}
        icon={<FileText size={22} />}
        color="blue"
      />

      <StatCard
        title="Pending"
        value={pending}
        icon={<Clock size={22} />}
        color="amber"
      />

      <StatCard
        title="Submitted"
        value={submitted}
        icon={<CheckCircle2 size={22} />}
        color="purple"
      />

      <StatCard
        title="Graded"
        value={graded}
        icon={<CheckCircle2 size={22} />}
        color="emerald"
      />

      <StatCard
        title="Overdue"
        value={overdue}
        icon={<XCircle size={22} />}
        color="red"
      />
    </div>
  );
}

function StatCard({ title, value, icon, color = "blue" }) {
  const colors = {
    blue: "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-400",
    amber:
      "border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400",
    purple:
      "border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-900 dark:bg-purple-950/20 dark:text-purple-400",
    emerald:
      "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-400",
    red: "border-red-100 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </p>

        {icon}
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default AssignmentsStats;
