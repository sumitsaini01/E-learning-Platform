import { useEffect, useState } from "react";
import { Heart, Star, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import {
  getSavedCourses,
  removeSavedCourse,
  saveCourse,
} from "../../services/courseService";

const formatPrice = (price) => {
  if (Number(price) === 0) return "Free";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
};

const formatCategory = (category) => {
  if (!category) return "Course";

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getCourseId = (course) => course?._id || course?.id;

const getUserId = (value) => {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || value.id || "";
};

function CourseCard({ course }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const courseId = getCourseId(course);
  const instructorName =
    course?.instructor?.name || course?.instructor || "SkillSphere Instructor";

  const rating = course?.averageRating || course?.rating || 4.8;
  const reviews =
    course?.reviewsCount ||
    course?.reviews?.length ||
    course?.students?.length ||
    0;

  const [isSaved, setIsSaved] = useState(Boolean(course?.isSaved));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedStatus = async () => {
      if (!courseId || !isAuthenticated || user?.role !== "student") {
        setIsSaved(false);
        return;
      }

      try {
        const data = await getSavedCourses();

        const saved = (data.courses || []).some(
          (savedCourse) => getUserId(savedCourse) === courseId,
        );

        setIsSaved(saved);
      } catch {
        setIsSaved(false);
      }
    };

    loadSavedStatus();
  }, [courseId, isAuthenticated, user?.role]);

  const handleToggleSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!courseId) return;

    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login", {
        state: {
          from: location,
        },
      });
      return;
    }

    try {
      setIsSaving(true);

      if (isSaved) {
        await removeSavedCourse(courseId);
        setIsSaved(false);
      } else {
        await saveCourse(courseId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Unable to update saved course", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500">
        {course?.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                {formatCategory(course?.category)}
              </p>
              <h3 className="mt-2 text-xl font-bold">{course?.title}</h3>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          className={`absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-950 ${
            isSaved
              ? "text-red-500"
              : "text-slate-700 hover:text-red-500 dark:text-slate-300"
          }`}
          aria-label={isSaved ? "Remove saved course" : "Save course"}
          title={isSaved ? "Remove saved course" : "Save course"}
        >
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/courses/${courseId}`}>
          <h2 className="line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {course?.title}
          </h2>
        </Link>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <User size={14} />
          </div>

          <span className="line-clamp-1">{instructorName}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <Star size={16} className="text-amber-500" fill="currentColor" />

            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {rating}
            </span>

            {reviews ? <span>({reviews})</span> : null}
          </div>

          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(course?.price)}
          </p>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
