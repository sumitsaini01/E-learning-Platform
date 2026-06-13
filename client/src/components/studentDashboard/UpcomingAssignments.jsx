import { Link } from "react-router-dom";
import AssignmentStatusBadge from "../assignments/AssignmentStatusBadge";
import DashboardSection from "./DashboardSection";

const upcomingAssignments = [
  {
    _id: "1",
    title: "React Components Practice",
    courseTitle: "Frontend Development",
    dueDate: "2026-06-30",
    status: "pending",
  },
  {
    _id: "2",
    title: "MongoDB Schema Design",
    courseTitle: "Backend Development",
    dueDate: "2026-07-05",
    status: "submitted",
  },
  {
    _id: "3",
    title: "Full Stack Mini Project",
    courseTitle: "Full Stack Development",
    dueDate: "2026-07-12",
    status: "pending",
  },
];

function UpcomingAssignments() {
  return (
    <DashboardSection
      title="Upcoming Assignments"
      description="Assignments and submissions you need to track."
      action={
        <Link
          to="/assignments"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View All
        </Link>
      }
    >
      <div className="space-y-4">
        {upcomingAssignments.map((assignment) => (
          <div
            key={assignment._id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white">
                {assignment.title}
              </h3>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {assignment.courseTitle}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Due:{" "}
                {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AssignmentStatusBadge status={assignment.status} />

              <Link
                to={`/assignments/${assignment._id}`}
                className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

export default UpcomingAssignments;
