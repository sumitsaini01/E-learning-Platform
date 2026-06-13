import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import SearchForm from "./SearchForm";
import ThemeToggle from "./ThemeToggle";
import { getRoleRedirectPath } from "../../utils/getRoleRedirectPath";

function MobileMenu({
  links = [],
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  isAuthenticated,
  user,
  isDarkMode,
  toggleTheme,
  onLogout,
}) {
  return (
    <div className="border-t border-slate-200 bg-white px-4 py-5 shadow-lg dark:border-slate-800 dark:bg-slate-950 lg:hidden">
      <div className="mb-5">
        <SearchForm
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={onSearchSubmit}
          placeholder="Search courses..."
        />
      </div>

      <div className="grid gap-2">
        {links.map((link) =>
          link.items ? (
            <MobileDropdown key={link.label} link={link} />
          ) : (
            <MobileLink key={link.to} to={link.to}>
              {link.label}
            </MobileLink>
          ),
        )}

        {isAuthenticated ? (
          <>
            <MobileLink to={getRoleRedirectPath(user?.role)}>
              Dashboard
            </MobileLink>

            {user?.role === "student" && (
              <MobileLink to="/my-courses">My Courses</MobileLink>
            )}

            <MobileLink to="/profile">Profile</MobileLink>

            <div className="flex items-center justify-between rounded-2xl px-4 py-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Theme
              </span>

              <ThemeToggle isDarkMode={isDarkMode} onClick={toggleTheme} />
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <MobileLink to="/login">Login</MobileLink>

            <NavLink
              to="/register"
              className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}

function MobileDropdown({ link }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
      >
        {link.label}
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-1 grid gap-1 rounded-2xl bg-slate-50 p-2 dark:bg-slate-900">
          {link.items.map((item) => (
            <MobileLink key={item.to} to={item.to} nested>
              {item.label}
            </MobileLink>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileLink({ to, children, nested = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-2xl py-3 text-sm font-semibold transition-all duration-200",
          nested ? "px-5" : "px-4",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
            : "text-slate-700 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default MobileMenu;
