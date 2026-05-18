import { NavLink } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Login", to: "/login" },
  { label: "Register", to: "/register" },
];

function Navbar() {
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

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
