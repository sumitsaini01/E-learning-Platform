import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  const { id, slug, name, description, icon, coursesCount, color } = category;

  const bgColor = color || "from-blue-500 to-cyan-500";

  return (
    <Link to={`/courses?category=${slug || name}`} className="group block">
      <article className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className={`bg-gradient-to-br ${bgColor} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
              {icon || "📚"}
            </div>

            <ArrowRight
              size={22}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>

          <h3 className="mt-5 text-xl font-bold leading-tight">{name}</h3>

          <p className="mt-2 text-sm text-white/80">
            {coursesCount || 0} Courses Available
          </p>
        </div>

        <div className="p-6">
          <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description || "Explore courses and build your skills."}
          </p>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {coursesCount || 0} Courses
            </span>

            <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
              Explore
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default CategoryCard;
