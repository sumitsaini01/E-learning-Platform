import { BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

function BrandLogo() {
  return (
    <NavLink
      to="/"
      className="flex items-center gap-3 transition-transform hover:scale-[1.02]"
    >
      <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-600/20">
        <BookOpen size={20} />
      </div>

      <div className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          SkillSphere
        </span>

        <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
          Learn • Build • Grow
        </span>
      </div>
    </NavLink>
  );
}

export default BrandLogo;
