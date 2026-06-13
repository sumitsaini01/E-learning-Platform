import {
  Award,
  BookOpen,
  GraduationCap,
  IndianRupee,
  Users,
} from "lucide-react";

import AdminStatCard from "./AdminStatCard";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function AdminStatsSection({ summary = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <AdminStatCard
        title="Total Users"
        value={summary.totalUsers || 0}
        subtitle={`${summary.totalStudents || 0} students • ${
          summary.totalInstructors || 0
        } instructors`}
        icon={Users}
      />

      <AdminStatCard
        title="Courses"
        value={summary.totalCourses || 0}
        subtitle={`${summary.publishedCourses || 0} published • ${
          summary.draftCourses || 0
        } draft`}
        icon={BookOpen}
      />

      <AdminStatCard
        title="Enrollments"
        value={summary.totalEnrollments || 0}
        subtitle={`${summary.paidEnrollments || 0} paid • ${
          summary.freeEnrollments || 0
        } free`}
        icon={GraduationCap}
      />

      <AdminStatCard
        title="Revenue"
        value={formatCurrency(summary.totalRevenue)}
        subtitle="Total platform revenue"
        icon={IndianRupee}
      />

      <AdminStatCard
        title="Certificates"
        value={summary.certificatesIssued || 0}
        subtitle="Issued certificates"
        icon={Award}
      />
    </div>
  );
}

export default AdminStatsSection;
