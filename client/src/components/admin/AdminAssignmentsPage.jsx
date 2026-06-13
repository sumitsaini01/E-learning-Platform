import { ClipboardList, Clock, FileText, Users } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";

const assignments = [
  {
    id: 1,
    title: "React Components Practice",
    course: "Frontend Development",
    status: "Published",
    submissions: 18,
  },
  {
    id: 2,
    title: "MongoDB Schema Design",
    course: "Backend Development",
    status: "Draft",
    submissions: 9,
  },
];

function AdminAssignmentsPage() {
  return (
    <section className="space-y-6">
      <AdminPageHeader
        badge="Assignment Monitoring"
        title="Admin Assignments"
        description="Monitor platform assignments. Admin can review assignment activity but should not create instructor content."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Assignments"
          value={assignments.length}
          icon={ClipboardList}
        />
        <AdminStatCard title="Published" value={1} icon={FileText} />
        <AdminStatCard title="Draft" value={1} icon={Clock} />
        <AdminStatCard title="Submissions" value={27} icon={Users} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Recent Assignments
        </h2>

        <div className="mt-5 space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <h3 className="font-semibold text-slate-950 dark:text-white">
                {assignment.title}
              </h3>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {assignment.course}
              </p>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {assignment.status} • {assignment.submissions} submissions
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminAssignmentsPage;
