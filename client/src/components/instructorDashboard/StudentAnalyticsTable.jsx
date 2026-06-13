function StudentAnalyticsTable({ studentAnalytics = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Student Analytics
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track student quiz attempts, pass/fail count, and average scores.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-3 pr-4 font-semibold">Student</th>
              <th className="py-3 pr-4 font-semibold">Attempts</th>
              <th className="py-3 pr-4 font-semibold">Passed</th>
              <th className="py-3 pr-4 font-semibold">Failed</th>
              <th className="py-3 pr-4 font-semibold">Avg Score</th>
              <th className="py-3 pr-4 font-semibold">Courses Attempted</th>
            </tr>
          </thead>

          <tbody>
            {studentAnalytics.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  No student quiz analytics yet.
                </td>
              </tr>
            ) : (
              studentAnalytics.map((item) => (
                <tr
                  key={item.student?._id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {item.student?.name || "Student"}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.student?.email}
                    </p>
                  </td>

                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                    {item.attempts}
                  </td>

                  <td className="py-4 pr-4 font-semibold text-emerald-700 dark:text-emerald-300">
                    {item.passed}
                  </td>

                  <td className="py-4 pr-4 font-semibold text-red-700 dark:text-red-300">
                    {item.failed}
                  </td>

                  <td className="py-4 pr-4 font-semibold text-slate-950 dark:text-white">
                    {item.averageScore}%
                  </td>

                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                    {item.coursesAttempted}
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

export default StudentAnalyticsTable;
