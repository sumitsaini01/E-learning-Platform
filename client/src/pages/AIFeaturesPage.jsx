import { Link } from "react-router-dom";
import {
  Brain,
  Briefcase,
  ClipboardList,
  FileText,
  GraduationCap,
  Map,
  Route,
  Sparkles,
  Target,
} from "lucide-react";

const aiTools = [
  {
    title: "Career Roadmap",
    description:
      "Create a step-by-step roadmap for your target role and career goals.",
    icon: Map,
    path: "/career-roadmap",
    tag: "Career",
  },
  {
    title: "Learning Path",
    description:
      "Follow structured learning paths based on your goals and skill level.",
    icon: Route,
    path: "/learning-path",
    tag: "Learning",
  },
  {
    title: "Skill Tracking",
    description:
      "Track your current skills, identify gaps, and monitor progress.",
    icon: Target,
    path: "/skills",
    tag: "Progress",
  },
  {
    title: "Study Planner",
    description:
      "Plan study sessions, deadlines, and preparation schedules effectively.",
    icon: GraduationCap,
    path: "/study-planner",
    tag: "Planning",
  },
  {
    title: "Resume Analyzer",
    description:
      "Analyze your resume and improve it for software roles and internships.",
    icon: FileText,
    path: "/resume-analyzer",
    tag: "Resume",
  },
  {
    title: "Mock Interview",
    description:
      "Practice interview questions and improve your confidence before applying.",
    icon: Brain,
    path: "/mock-interview",
    tag: "Interview",
  },
  {
    title: "Job Readiness Score",
    description:
      "Estimate your job readiness based on skills, projects, resume, and prep.",
    icon: Briefcase,
    path: "/job-readiness",
    tag: "Placement",
  },
  {
    title: "Interview Prep",
    description:
      "Generate technical, MCQ, coding, and HR questions for your target company.",
    icon: ClipboardList,
    path: "/interview-prep",
    tag: "Practice",
  },
];

function AIFeaturesPage() {
  return (
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative p-8 sm:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-400/10" />

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <Sparkles size={16} />
                AI Features
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Career & Learning AI Suite
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                Use SkillSphere AI tools to plan your career, track skills,
                improve your resume, prepare for interviews, and become
                job-ready.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {aiTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.title}
                to={tool.path}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                    <Icon size={26} />
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tool.tag}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                  {tool.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {tool.description}
                </p>

                <p className="mt-5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Open tool →
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AIFeaturesPage;
