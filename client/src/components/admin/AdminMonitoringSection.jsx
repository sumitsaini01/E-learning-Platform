import AdminAnalyticsList from "./AdminAnalyticsList";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function AdminMonitoringSection({ monitoring }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
        Platform Monitoring
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
        Latest platform activity
      </h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminAnalyticsList
          title="Latest Users"
          items={(monitoring?.latestUsers || []).map((user) => ({
            label: user.name,
            value: user.role,
          }))}
        />

        <AdminAnalyticsList
          title="Latest Courses"
          items={(monitoring?.latestCourses || []).map((course) => ({
            label: course.title,
            value: course.status,
          }))}
        />

        <AdminAnalyticsList
          title="Latest Orders"
          items={(monitoring?.latestOrders || []).map((order) => ({
            label: order.course?.title || "Course",
            value: formatCurrency(order.amount),
          }))}
        />

        <AdminAnalyticsList
          title="Latest Quiz Attempts"
          items={(monitoring?.latestQuizAttempts || []).map((attempt) => ({
            label: attempt.quiz?.title || "Quiz",
            value: `${attempt.percentage || 0}%`,
          }))}
        />
      </div>
    </div>
  );
}

export default AdminMonitoringSection;
