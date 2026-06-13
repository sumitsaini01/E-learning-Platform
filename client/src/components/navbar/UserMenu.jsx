import { BookOpen, LayoutDashboard, User } from "lucide-react";
import { NavLink } from "react-router-dom";

import { getRoleRedirectPath } from "../../utils/getRoleRedirectPath";

function UserMenu({ user }) {
  return (
    <>
      <NavLink
        to={getRoleRedirectPath(user?.role)}
        className={({ isActive }) =>
          [
            "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
            isActive
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
              : "text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300",
          ].join(" ")
        }
      >
        <span className="inline-flex items-center gap-2">
          <LayoutDashboard size={16} />
          Dashboard
        </span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          [
            "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
            isActive
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
              : "text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300",
          ].join(" ")
        }
      >
        <span className="inline-flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <span className="max-w-24 truncate">{user?.name}</span>
        </span>
      </NavLink>
    </>
  );
}

export default UserMenu;
