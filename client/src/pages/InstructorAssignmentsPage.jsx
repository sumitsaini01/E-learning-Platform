import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  PlusCircle,
  Trash2,
  Users,
} from "lucide-react";

const assignments = [
  {
    id: 1,
    title: "React Components Practice",
    course: "Frontend Development",
    dueDate: "Coming Soon",
    submissions: 18,
    status: "published",
  },
  {
    id: 2,
    title: "MongoDB Schema Design",
    course: "Backend Development",
    dueDate: "Coming Soon",
    submissions: 9,
    status: "draft",
  },
  {
    id: 3,
    title: "Full Stack Mini Project",
    course: "Full Stack Development",
    dueDate: "Coming Soon",
    submissions: 24,
    status: "published",
  },
];

function InstructorAssignmentsPage() {
  const totalAssignments = assignments.length;
  const publishedAssignments = assignments.filter(
    (assignment) => assignment.status === "published",
  ).length;
  const draftAssignments = assignments.filter(
    (assignment) => assignment.status === "draft",
  ).length;
  const totalSubmissions = assignments.reduce(
    (total, assignment) => total + assignment.submissions,
    0,
  );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Assignment Management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
              Instructor Assignments
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Create assignments, track deadlines, and review student
              submissions.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <PlusCircle size={18} />
            Create Assignment
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FileText size={22} />}
          label="Total"
          value={totalAssignments}
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Published"
          value={publishedAssignments}
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Draft"
          value={draftAssignments}
        />
        <StatCard
          icon={<Users size={22} />}
          label="Submissions"
          value={totalSubmissions}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Assignment List
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage assignment visibility, deadlines, and submissions.
        </p>

        <div className="mt-6 space-y-4">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function AssignmentCard({ assignment }) {
  const isPublished = assignment.status === "published";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-slate-950 dark:text-white">
            {assignment.title}
          </h3>

          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
              isPublished
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            {assignment.status}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {assignment.course}
        </p>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} />
            Due: {assignment.dueDate}
          </span>

          <span className="inline-flex items-center gap-1">
            <Users size={14} />
            {assignment.submissions} submissions
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Edit size={16} />
          Edit
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </article>
  );
}

export default InstructorAssignmentsPage;
