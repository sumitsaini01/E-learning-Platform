import { ArrowLeft, CalendarDays, FileText, Upload } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import AssignmentStatusBadge from "../components/assignments/AssignmentStatusBadge";

const assignments = [
  {
    _id: "1",
    title: "React Components Practice",
    description:
      "Build reusable React components and create a small dashboard layout using props and state.",
    courseTitle: "Frontend Development",
    dueDate: "2026-06-30",
    maxMarks: 100,
    status: "pending",
    instructions:
      "Create at least 4 reusable React components. Use props properly, manage state where required, and make the layout responsive using Tailwind CSS.",
  },
  {
    _id: "2",
    title: "MongoDB Schema Design",
    description:
      "Design Mongoose schemas for users, courses, quizzes, and assignments with proper references.",
    courseTitle: "Backend Development",
    dueDate: "2026-07-05",
    maxMarks: 80,
    status: "submitted",
    instructions:
      "Create schema structure for an LMS system. Include references, indexes, validation rules, and timestamps.",
  },
];

function AssignmentDetailsPage() {
  const { assignmentId } = useParams();

  const assignment =
    assignments.find((item) => item._id === assignmentId) || assignments[0];

  return (
    <section className="space-y-6">
      <Link
        to="/assignments"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Assignment Details
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
              {assignment.title}
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {assignment.courseTitle}
            </p>
          </div>

          <AssignmentStatusBadge status={assignment.status} />
        </div>

        <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {assignment.description}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<CalendarDays size={20} />}
            label="Due Date"
            value={new Date(assignment.dueDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />

          <InfoCard
            icon={<FileText size={20} />}
            label="Max Marks"
            value={`${assignment.maxMarks} Marks`}
          />

          <InfoCard
            icon={<Upload size={20} />}
            label="Submission"
            value="Not Connected Yet"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Instructions
        </h2>

        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {assignment.instructions}
        </p>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Submit Assignment
        </h2>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          File upload and submission backend will be connected later.
        </p>

        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Upload size={16} />
          Upload Submission
        </button>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-1 font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default AssignmentDetailsPage;
