import AssignmentCard from "../components/assignments/AssignmentCard";
import AssignmentsStats from "../components/assignments/AssignmentsStats";

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
  },
  {
    _id: "3",
    title: "Full Stack Mini Project",
    description:
      "Create a complete MERN feature with frontend UI, backend API, validation, and database integration.",
    courseTitle: "Full Stack Development",
    dueDate: "2026-07-12",
    maxMarks: 150,
    status: "pending",
  },
  {
    _id: "4",
    title: "Authentication Flow Report",
    description:
      "Explain JWT authentication, protected routes, role-based access, and refresh-safe login flow.",
    courseTitle: "MERN Authentication",
    dueDate: "2026-06-20",
    maxMarks: 60,
    status: "graded",
  },
];

function AssignmentsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Assignments
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          My Assignments
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Track upcoming assignments, submissions, grading status, and
          deadlines.
        </p>
      </div>

      <AssignmentsStats assignments={assignments} />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Assignment List
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Backend integration will be connected later.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AssignmentsPage;
