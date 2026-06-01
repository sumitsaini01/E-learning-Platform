import { Link } from "react-router-dom";

const formatPrice = (price) =>
  Number(price) === 0
    ? "Free"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(price || 0));

const formatCategory = (category) => {
  if (!category) return "Uncategorized";

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function CourseCard({ course }) {
  const courseId = course?._id || course?.id;
  const instructorName = course?.instructor?.name || "SkillSphere Instructor";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {course?.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-stone-100 px-5 text-center">
          <p className="text-sm font-semibold text-emerald-800">
            SkillSphere Course
          </p>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {formatCategory(course?.category)}
          </span>

          <span className="text-sm font-semibold text-zinc-950">
            {formatPrice(course?.price)}
          </span>
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <h2 className="text-lg font-semibold leading-6 text-zinc-950">
            {course?.title}
          </h2>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
            {course?.description}
          </p>

          <div className="mt-5 border-t border-zinc-100 pt-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Instructor
            </p>

            <p className="mt-1 text-sm font-medium text-zinc-800">
              {instructorName}
            </p>
          </div>
        </div>

        <Link
          to={`/courses/${courseId}`}
          className="mt-5 inline-flex justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export default CourseCard;