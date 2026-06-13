import { Star } from "lucide-react";

function TestimonialCard({ testimonial }) {
  const { name, role, avatar, rating = 5, message, company } = testimonial;

  return (
    <article className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 text-4xl font-bold leading-none text-blue-200 dark:text-blue-900">
        "
      </div>

      <div className="flex items-center gap-1">
        {[...Array(rating)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className="text-amber-500"
            fill="currentColor"
          />
        ))}
      </div>

      <p className="mt-4 min-h-[120px] text-sm leading-7 text-slate-600 dark:text-slate-400">
        "{message}"
      </p>

      <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white shadow-md">
            {name?.charAt(0)?.toUpperCase()}
          </div>
        )}

        <div>
          <h4 className="font-semibold text-slate-950 dark:text-white">
            {name}
          </h4>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {role}
            {company ? ` • ${company}` : ""}
          </p>
        </div>
      </div>
    </article>
  );
}

export default TestimonialCard;
