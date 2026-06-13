import { CalendarDays, FileQuestion, FileText } from "lucide-react";
import { Link } from "react-router-dom";

import DashboardSection from "./DashboardSection";

const deadlines = [
  {
    id: 1,
    title: "React Components Practice",
    type: "Assignment",
    courseTitle: "Frontend Development",
    dueDate: "2026-06-30",
    to: "/assignments/1",
    icon: FileText,
  },
  {
    id: 2,
    title: "Frontend Development Quiz",
    type: "Quiz",
    courseTitle: "Frontend Development",
    dueDate: "2026-07-03",
    to: "/quizzes",
    icon: FileQuestion,
  },
  {
    id: 3,
    title: "MongoDB Schema Design",
    type: "Assignment",
    courseTitle: "Backend Development",
    dueDate: "2026-07-05",
    to: "/assignments/2",
    icon: FileText,
  },
];

function UpcomingDeadlines() {
  return (
    <DashboardSection
      title="Upcoming Deadlines"
      description="Assignments, quizzes, and learning tasks due soon."
      action={
        <Link
          to="/calendar"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View Calendar
        </Link>
      }
    >
      <div className="space-y-4">
        {deadlines.map((deadline) => {
          const Icon = deadline.icon;

          return (
            <Link
              key={deadline.id}
              to={deadline.to}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                  <Icon size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">
                    {deadline.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {deadline.courseTitle} • {deadline.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <CalendarDays size={14} />
                {new Date(deadline.dueDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardSection>
  );
}

export default UpcomingDeadlines;
