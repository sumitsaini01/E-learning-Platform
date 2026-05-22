import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRoleRedirectPath } from "../utils/getRoleRedirectPath";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
];

function Navbar() {

  const navigate = useNavigate();

  const { isAuthenticated, logout, user } = useAuth();

  const getLinkClass = ({ isActive }) =>
    [
      "rounded-md px-3 py-2 text-sm font-medium transition",
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
    ].join(" ");

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-semibold text-zinc-950">
          SkillSphere
        </NavLink>

        <div className="flex flex-wrap items-center justify-end gap-1">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClass}>
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  [
                    "max-w-28 truncate rounded-md px-3 py-2 text-sm font-medium transition sm:max-w-none",
                    isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                  ].join(" ")
                }
              >
                {user?.name}
              </NavLink>
              <NavLink to={getRoleRedirectPath(user?.role)} className={getLinkClass}>
                Dashboard
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={getLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
