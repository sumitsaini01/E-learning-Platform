import { CalendarDays, Clock, FileQuestion, GraduationCap } from "lucide-react";

const events = [
  {
    id: 1,
    title: "React Components Assignment",
    type: "Assignment",
    date: "Coming Soon",
    icon: FileQuestion,
  },
  {
    id: 2,
    title: "Frontend Development Quiz",
    type: "Quiz",
    date: "Coming Soon",
    icon: Clock,
  },
  {
    id: 3,
    title: "Full Stack Course Milestone",
    type: "Course",
    date: "Coming Soon",
    icon: GraduationCap,
  },
];

function CalendarPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Calendar
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Learning Calendar
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Track upcoming quizzes, assignments, course milestones, and deadlines.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
            <CalendarDays size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Upcoming Schedule
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Backend calendar integration will be connected later.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {events.map((event) => {
            const Icon = event.icon;

            return (
              <div
                key={event.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-slate-100 p-3 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                      {event.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {event.type}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {event.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CalendarPage;
