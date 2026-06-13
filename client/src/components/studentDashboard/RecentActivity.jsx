import DashboardSection from "./DashboardSection";

function RecentActivity({ activities = [] }) {
  return (
    <DashboardSection
      title="Recent Activity"
      description="Your latest learning actions."
    >
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No activity yet.
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity._id}
              className="flex gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="mt-1 h-3 w-3 rounded-full bg-blue-500" />

              <div className="flex-1">
                <p className="font-semibold text-slate-950 dark:text-white">
                  {activity.title}
                </p>

                {activity.message ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {activity.message}
                  </p>
                ) : null}

                {activity.course?.title ? (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                    Course: {activity.course.title}
                  </p>
                ) : null}

                <p className="mt-2 text-xs text-slate-400">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardSection>
  );
}

export default RecentActivity;
