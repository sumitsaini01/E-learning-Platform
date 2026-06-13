import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  Trophy,
} from "lucide-react";
import StatCard from "./StatCard";

function DashboardStats({ dashboardStats, user }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        title="Enrolled Courses"
        value={dashboardStats.enrolledCourses}
        icon={<BookOpen size={22} className="text-blue-600" />}
        color="blue"
      />

      <StatCard
        title="Learning Streak"
        value={`🔥 ${user?.learningStreak?.currentStreak || 0}`}
        subtitle={`Longest: ${user?.learningStreak?.longestStreak || 0} days`}
        icon={<Flame size={22} className="text-orange-600" />}
        color="orange"
      />

      <StatCard
        title="Completed Lessons"
        value={dashboardStats.completedLessons}
        subtitle={`of ${dashboardStats.totalLessons} lessons`}
        icon={<CheckCircle2 size={22} className="text-emerald-600" />}
        color="emerald"
      />

      <StatCard
        title="Average Progress"
        value={`${dashboardStats.averageProgress}%`}
        icon={<BarChart3 size={22} className="text-blue-600" />}
        color="blue"
      />

      <StatCard
        title="Quiz Average"
        value={`${dashboardStats.averageQuizScore}%`}
        subtitle={`${dashboardStats.passedQuizzes} passed • ${dashboardStats.failedQuizzes} failed`}
        icon={<Trophy size={22} className="text-purple-600" />}
        color="purple"
      />

      <StatCard
        title="Certificates"
        value={dashboardStats.certificatesEarned}
        icon={<Award size={22} className="text-emerald-600" />}
        color="emerald"
      />
    </div>
  );
}

export default DashboardStats;
