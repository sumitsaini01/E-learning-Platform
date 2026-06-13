const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function CoursePerformanceTable({ courses = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Course Performance
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Compare enrollments, revenue, ratings, and quiz performance.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-3 pr-4 font-semibold">Course</th>
              <th className="py-3 pr-4 font-semibold">Students</th>
              <th className="py-3 pr-4 font-semibold">Revenue</th>
              <th className="py-3 pr-4 font-semibold">Rating</th>
              <th className="py-3 pr-4 font-semibold">Quiz Attempts</th>
              <th className="py-3 pr-4 font-semibold">Pass Rate</th>
              <th className="py-3 pr-4 font-semibold">Avg Score</th>
            </tr>
          </thead>

          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  No course performance data yet.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-4 pr-4 font-semibold text-slate-950 dark:text-white">
                    {course.title}
                  </td>

                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                    {course.students}
                  </td>

                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                    {formatCurrency(course.revenue)}
                  </td>

                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                    {(course.averageRating || 0).toFixed(1)}
                  </td>

                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                    {course.quizAttempts}
                  </td>

                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                    {course.quizPassRate}%
                  </td>

                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                    {course.averageQuizScore}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CoursePerformanceTable;
