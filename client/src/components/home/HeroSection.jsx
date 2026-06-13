import {
  ArrowRight,
  BookOpen,
  PlayCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950/40">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-6 lg:pb-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-800 dark:bg-slate-900/80 dark:text-blue-300">
            <Sparkles size={16} />
            AI-Powered Learning Platform
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
            Learn Without Limits, Teach With Confidence.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            SkillSphere helps students learn smarter, instructors manage courses
            faster, and admins monitor the complete learning ecosystem from one
            modern platform.
          </p>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Explore Courses
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:text-blue-300"
            >
              <PlayCircle size={18} />
              How It Works
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
            <HeroStat value="10K+" label="Learners" />
            <HeroStat value="500+" label="Courses" />
            <HeroStat value="95%" label="Success" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 hidden rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900 sm:block">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <Users size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white">
                  Live Learning
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Join active students
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-2xl shadow-blue-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-blue-950/20">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Current Course</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    Full Stack Development
                  </h2>
                </div>

                <div className="rounded-2xl bg-white/20 p-3">
                  <BookOpen size={26} />
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-white/15 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-sm">
                  <span>Course Progress</span>
                  <span>78%</span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-white/20">
                  <div className="h-2 w-[78%] rounded-full bg-white" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <MiniCard title="Lessons" value="42" />
                <MiniCard title="Projects" value="8" />
              </div>
            </div>
          </div>

          <div className="absolute -right-4 bottom-8 hidden rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900 sm:block">
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Certificate Ready
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete and verify online
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }) {
  return (
    <div>
      <p className="text-2xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4">
      <p className="text-sm text-blue-100">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default HeroSection;
