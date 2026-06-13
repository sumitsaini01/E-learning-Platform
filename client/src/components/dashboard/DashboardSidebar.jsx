import {
  ShieldCheck,
  BarChart3,
  BookOpen,
  FileQuestion,
  LayoutDashboard,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const studentLinks = [
  { label: "Dashboard", to: "/dashboard/student", icon: LayoutDashboard },
  { label: "My Courses", to: "/my-courses", icon: BookOpen },
  { label: "Quizzes", to: "/quizzes", icon: FileQuestion },
  { label: "Certificates", to: "/my-certificates", icon: Trophy },
  { label: "Settings", to: "/settings", icon: Settings },
];

const instructorLinks = [
  { label: "Dashboard", to: "/dashboard/instructor", icon: LayoutDashboard },
  { label: "Courses", to: "/instructor/courses", icon: BookOpen },
  { label: "Quizzes", to: "/instructor/quizzes", icon: FileQuestion },
  { label: "Students", to: "/instructor/students", icon: Users },
  { label: "Analytics", to: "/instructor/analytics", icon: BarChart3 },
  { label: "Settings", to: "/instructor/settings", icon: Settings },
];

const adminLinks = [
  { label: "Dashboard", to: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Quizzes", to: "/admin/quizzes", icon: FileQuestion },

  {
    label: "Security",
    to: "/admin/security",
    icon: ShieldCheck,
  },

  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function getSidebarLinks(role) {
  if (role === "instructor") return instructorLinks;
  if (role === "admin") return adminLinks;
  return studentLinks;
}

function DashboardSidebar() {
  const { user } = useAuth();

  const links = getSidebarLinks(user?.role);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
      <Link
        to="/"
        className="block border-b border-slate-200 px-6 py-6 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
      >
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          SkillSphere
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Learn • Build • Grow
        </p>
      </Link>

      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-4 text-white">
          <p className="text-sm font-semibold">
            {user?.role === "instructor"
              ? "Instructor Studio"
              : user?.role === "admin"
                ? "Admin Control"
                : "AI Learning Suite"}
          </p>

          <p className="mt-2 text-xs text-blue-100">
            {user?.role === "instructor"
              ? "Manage courses, quizzes, students, and analytics."
              : user?.role === "admin"
                ? "Monitor users, courses, revenue, and platform health."
                : "Build skills faster with SkillSphere AI tools."}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
