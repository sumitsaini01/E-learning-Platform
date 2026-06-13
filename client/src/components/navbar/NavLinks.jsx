import { ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";

function NavLinks({ links, className = "" }) {
  return (
    <div className={`items-center gap-2 ${className}`}>
      {links.map((link) =>
        link.items ? (
          <div key={link.label} className="group relative">
            <button className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300">
              {link.label}
              <ChevronDown size={15} />
            </button>

            <div className="invisible absolute left-0 top-full z-50 mt-3 w-56 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900">
              {link.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [
                "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ),
      )}
    </div>
  );
}

export default NavLinks;
