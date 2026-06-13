import { BookOpen, IndianRupee, Star, UserPlus, Users } from "lucide-react";

import InstructorStatCard from "./InstructorStatCard";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function InstructorStats({ summary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <InstructorStatCard
        title="Total Courses"
        value={summary?.totalCourses || 0}
        subtitle={`${summary?.publishedCourses || 0} published • ${
          summary?.draftCourses || 0
        } draft`}
        icon={<BookOpen size={22} />}
        color="blue"
      />

      <InstructorStatCard
        title="Students"
        value={summary?.totalStudents || 0}
        icon={<Users size={22} />}
        color="emerald"
      />

      <InstructorStatCard
        title="Enrollments"
        value={summary?.totalEnrollments || 0}
        icon={<UserPlus size={22} />}
        color="purple"
      />

      <InstructorStatCard
        title="Revenue"
        value={formatCurrency(summary?.totalRevenue)}
        icon={<IndianRupee size={22} />}
        color="amber"
      />

      <InstructorStatCard
        title="Average Rating"
        value={(summary?.averageRating || 0).toFixed(1)}
        subtitle={`${summary?.totalReviews || 0} reviews`}
        icon={<Star size={22} />}
        color="blue"
      />
    </div>
  );
}

export default InstructorStats;
