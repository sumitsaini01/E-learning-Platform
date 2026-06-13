import AdminAnalyticsList from "./AdminAnalyticsList";
import AdminMiniCard from "./AdminMiniCard";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function AdminAnalyticsSection({
  userAnalytics,
  courseAnalytics,
  revenueAnalytics,
  enrollmentAnalytics,
  quizAnalytics,
  certificateAnalytics,
}) {
  const userStats = userAnalytics?.totals || {};
  const userGrowth = userAnalytics?.growth || {};
  const userEngagement = userAnalytics?.engagement || {};
  const courseStats = courseAnalytics?.totals || {};
  const courseGrowth = courseAnalytics?.growth || {};

  return (
    <div className="space-y-6">
      <AnalyticsBlock
        badge="User Analytics"
        title="Platform user growth and activity"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <AdminMiniCard
            label="Students"
            value={userStats.totalStudents || 0}
          />
          <AdminMiniCard
            label="Instructors"
            value={userStats.totalInstructors || 0}
          />
          <AdminMiniCard label="Admins" value={userStats.totalAdmins || 0} />
          <AdminMiniCard
            label="Verified Users"
            value={userStats.verifiedUsers || 0}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <AdminMiniCard
            label="Unverified Users"
            value={userStats.unverifiedUsers || 0}
          />

          <AdminMiniCard
            label="Joined This Month"
            value={userGrowth.usersThisMonth || 0}
          />

          <AdminMiniCard
            label="Joined Last 7 Days"
            value={userGrowth.usersLast7Days || 0}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <AdminMiniCard
            label="Active Quiz Users (30 Days)"
            value={userEngagement.activeQuizUsersLast30Days || 0}
          />

          <AdminAnalyticsList
            title="Role Distribution"
            items={[
              {
                label: "Students",
                value: userAnalytics?.roleDistribution?.student || 0,
              },
              {
                label: "Instructors",
                value: userAnalytics?.roleDistribution?.instructor || 0,
              },
              {
                label: "Admins",
                value: userAnalytics?.roleDistribution?.admin || 0,
              },
            ]}
          />
        </div>
      </AnalyticsBlock>

      <AnalyticsBlock
        badge="Course Analytics"
        title="Course publishing, pricing, and category insights"
      >
        <div className="grid gap-4 md:grid-cols-5">
          <AdminMiniCard
            label="Total Courses"
            value={courseStats.totalCourses || 0}
          />
          <AdminMiniCard
            label="Published"
            value={courseStats.publishedCourses || 0}
          />
          <AdminMiniCard label="Draft" value={courseStats.draftCourses || 0} />
          <AdminMiniCard label="Free" value={courseStats.freeCourses || 0} />
          <AdminMiniCard label="Paid" value={courseStats.paidCourses || 0} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <AdminMiniCard
            label="Created This Month"
            value={courseGrowth.coursesThisMonth || 0}
          />
          <AdminMiniCard
            label="Created Last 7 Days"
            value={courseGrowth.coursesLast7Days || 0}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <AdminAnalyticsList
            title="Top Enrolled Courses"
            items={(courseAnalytics?.topEnrolledCourses || []).map(
              (course) => ({
                label: course.title,
                value: `${course.studentCount || 0} students`,
              }),
            )}
          />

          <AdminAnalyticsList
            title="Category Distribution"
            items={(courseAnalytics?.categoryDistribution || []).map(
              (item) => ({
                label: item.category,
                value: item.count,
              }),
            )}
          />

          <AdminAnalyticsList
            title="Level Distribution"
            items={(courseAnalytics?.levelDistribution || []).map((item) => ({
              label: item.level,
              value: item.count,
            }))}
          />
        </div>
      </AnalyticsBlock>

      <AnalyticsBlock
        badge="Revenue Analytics"
        title="Payment and revenue performance"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <AdminMiniCard
            label="Total Revenue"
            value={formatCurrency(revenueAnalytics?.totalRevenue)}
          />

          <AdminMiniCard
            label="Paid Orders"
            value={revenueAnalytics?.totalPaidOrders || 0}
          />

          <AdminMiniCard
            label="Average Order Value"
            value={formatCurrency(revenueAnalytics?.averageOrderValue)}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AdminAnalyticsList
            title="Top Revenue Courses"
            items={(revenueAnalytics?.topRevenueCourses || []).map((item) => ({
              label: item.title,
              value: formatCurrency(item.revenue),
            }))}
          />

          <AdminAnalyticsList
            title="Revenue Last 30 Days"
            items={(revenueAnalytics?.revenueLast30Days || [])
              .slice(-7)
              .map((item) => ({
                label: item.date,
                value: formatCurrency(item.revenue),
              }))}
          />
        </div>
      </AnalyticsBlock>

      <AnalyticsBlock
        badge="Enrollment Analytics"
        title="Student enrollment performance"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AdminMiniCard
            label="Total Enrollments"
            value={enrollmentAnalytics?.totalEnrollments || 0}
          />

          <AdminMiniCard
            label="Average Enrollments"
            value={enrollmentAnalytics?.averageEnrollments || 0}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AdminAnalyticsList
            title="Top Enrollment Courses"
            items={(enrollmentAnalytics?.topCourses || []).map((course) => ({
              label: course.title,
              value: `${course.studentCount || 0} students`,
            }))}
          />

          <AdminAnalyticsList
            title="Zero Enrollment Courses"
            items={(enrollmentAnalytics?.zeroEnrollmentCourses || []).map(
              (course) => ({
                label: course.title,
                value: course.status,
              }),
            )}
          />
        </div>
      </AnalyticsBlock>

      <AnalyticsBlock badge="Quiz Analytics" title="Quiz usage and performance">
        <div className="grid gap-4 md:grid-cols-4">
          <AdminMiniCard
            label="Total Quizzes"
            value={quizAnalytics?.totalQuizzes || 0}
          />
          <AdminMiniCard
            label="Published"
            value={quizAnalytics?.publishedQuizzes || 0}
          />
          <AdminMiniCard
            label="Attempts"
            value={quizAnalytics?.totalAttempts || 0}
          />
          <AdminMiniCard
            label="Pass Rate"
            value={`${quizAnalytics?.passRate || 0}%`}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AdminAnalyticsList
            title="Top Attempted Quizzes"
            items={(quizAnalytics?.topAttemptedQuizzes || []).map((quiz) => ({
              label: quiz.title,
              value: `${quiz.attempts} attempts`,
            }))}
          />

          <AdminAnalyticsList
            title="Quiz Summary"
            items={[
              {
                label: "Passed Attempts",
                value: quizAnalytics?.passedAttempts || 0,
              },
              {
                label: "Failed Attempts",
                value: quizAnalytics?.failedAttempts || 0,
              },
              {
                label: "Average Score",
                value: `${quizAnalytics?.averageScore || 0}%`,
              },
            ]}
          />
        </div>
      </AnalyticsBlock>

      <AnalyticsBlock
        badge="Certificate Analytics"
        title="Certificate issuing performance"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <AdminMiniCard
            label="Total Certificates"
            value={certificateAnalytics?.totalCertificates || 0}
          />
          <AdminMiniCard
            label="Active"
            value={certificateAnalytics?.activeCertificates || 0}
          />
          <AdminMiniCard
            label="Revoked"
            value={certificateAnalytics?.revokedCertificates || 0}
          />
        </div>

        <div className="mt-6">
          <AdminAnalyticsList
            title="Top Certificate Courses"
            items={(certificateAnalytics?.topCertificateCourses || []).map(
              (course) => ({
                label: course.title,
                value: `${course.certificates} certificates`,
              }),
            )}
          />
        </div>
      </AnalyticsBlock>
    </div>
  );
}

function AnalyticsBlock({ badge, title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
        {badge}
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
        {title}
      </h2>

      <div className="mt-6">{children}</div>
    </div>
  );
}

export default AdminAnalyticsSection;
