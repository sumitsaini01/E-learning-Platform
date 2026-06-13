import { Award, IndianRupee, Star, Users } from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function TopCourseCard({ course }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Award size={22} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Top Performing Course
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Best course based on revenue and engagement.
          </p>
        </div>
      </div>

      {!course ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No course performance data available yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">
            {course.title}
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-slate-500 dark:text-slate-400" />

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Students
                </p>

                <p className="font-semibold text-slate-950 dark:text-white">
                  {course.students}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IndianRupee
                size={18}
                className="text-slate-500 dark:text-slate-400"
              />

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revenue
                </p>

                <p className="font-semibold text-slate-950 dark:text-white">
                  {formatCurrency(course.revenue)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Star size={18} className="text-slate-500 dark:text-slate-400" />

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rating
                </p>

                <p className="font-semibold text-slate-950 dark:text-white">
                  {(course.averageRating || 0).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award size={18} className="text-slate-500 dark:text-slate-400" />

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reviews
                </p>

                <p className="font-semibold text-slate-950 dark:text-white">
                  {course.numReviews || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopCourseCard;
