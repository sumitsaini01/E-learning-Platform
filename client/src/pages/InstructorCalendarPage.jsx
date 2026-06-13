import {
  CalendarDays,
  Clock,
  FileQuestion,
  FileText,
  PlusCircle,
  Radio,
} from "lucide-react";

const calendarEvents = [
  {
    id: 1,
    title: "React Components Assignment Due",
    type: "assignment",
    course: "Frontend Development",
    date: "Coming Soon",
    time: "11:59 PM",
  },
  {
    id: 2,
    title: "JavaScript Basics Quiz Deadline",
    type: "quiz",
    course: "Frontend Development",
    date: "Coming Soon",
    time: "08:00 PM",
  },
  {
    id: 3,
    title: "Live Doubt Session",
    type: "live",
    course: "Full Stack Development",
    date: "Coming Soon",
    time: "06:00 PM",
  },
];

function InstructorCalendarPage() {
  const quizEvents = calendarEvents.filter((event) => event.type === "quiz");
  const assignmentEvents = calendarEvents.filter(
    (event) => event.type === "assignment",
  );
  const liveEvents = calendarEvents.filter((event) => event.type === "live");

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Instructor Calendar
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
              Schedule & Deadlines
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage quiz deadlines, assignment due dates, live sessions, and
              course events.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <PlusCircle size={18} />
            Create Event
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Total Events"
          value={calendarEvents.length}
        />

        <StatCard
          icon={<FileQuestion size={22} />}
          label="Quiz Deadlines"
          value={quizEvents.length}
        />

        <StatCard
          icon={<FileText size={22} />}
          label="Assignments"
          value={assignmentEvents.length}
        />

        <StatCard
          icon={<Radio size={22} />}
          label="Live Sessions"
          value={liveEvents.length}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Upcoming Schedule
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Events students will see on their learning calendar.
          </p>

          <div className="mt-6 space-y-4">
            {calendarEvents.map((event) => (
              <CalendarEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Calendar Tools
          </h2>

          <div className="mt-5 space-y-3">
            <ToolCard
              title="Quiz deadline"
              description="Set final date and time for quiz attempts."
            />

            <ToolCard
              title="Assignment due date"
              description="Create due dates for submissions and grading."
            />

            <ToolCard
              title="Live class"
              description="Schedule live sessions, doubt classes, or webinars."
            />

            <ToolCard
              title="Course event"
              description="Plan course launches, updates, or reminders."
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function CalendarEventCard({ event }) {
  const typeStyles = {
    quiz: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    assignment:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    live: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  };

  const icons = {
    quiz: <FileQuestion size={16} />,
    assignment: <FileText size={16} />,
    live: <Radio size={16} />,
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold capitalize ${
              typeStyles[event.type]
            }`}
          >
            {icons[event.type]}
            {event.type}
          </span>

          <h3 className="font-bold text-slate-950 dark:text-white">
            {event.title}
          </h3>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {event.course}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={16} />
          {event.date}
        </span>

        <span className="inline-flex items-center gap-1">
          <Clock size={16} />
          {event.time}
        </span>
      </div>
    </article>
  );
}

function ToolCard({ title, description }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>

      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default InstructorCalendarPage;
