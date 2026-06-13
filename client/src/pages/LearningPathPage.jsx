import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Route, Trash2 } from "lucide-react";
import {
  deleteLearningPath,
  generateLearningPath,
  getMyLearningPaths,
} from "../services/learningPathService";

const formatPrice = (price) =>
  Number(price) === 0
    ? "Free"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(price || 0));

function LearningPathPage() {
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [learningPaths, setLearningPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadLearningPaths = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getMyLearningPaths();

      setLearningPaths(data.learningPaths || []);
      setActivePath(data.learningPaths?.[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load learning paths.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!targetRole.trim()) {
      setError("Target role is required.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsGenerating(true);

      const data = await generateLearningPath({
        targetRole: targetRole.trim(),
      });

      setActivePath(data.learningPath);
      setMessage(data.message || "Learning path generated successfully.");

      await loadLearningPaths();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to generate learning path.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (pathId) => {
    const confirmed = window.confirm("Delete this learning path?");

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteLearningPath(pathId);

      setMessage("Learning path deleted successfully.");
      await loadLearningPaths();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete learning path.",
      );
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <Route size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Learning Path Recommendations
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                Recommended courses for your career goal
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                SkillSphere recommends courses using your skill profile,
                completed lessons, passed quizzes, certificates, and enrolled
                courses.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <form
              onSubmit={handleGenerate}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Generate Path
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Enter your target role and SkillSphere will recommend courses
                that fill your current skill gaps.
              </p>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Target Role
                </label>

                <input
                  type="text"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="Frontend Developer, Backend Developer..."
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isGenerating ? "Generating..." : "Generate Learning Path"}
              </button>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Previous Paths
              </h2>

              <div className="mt-4 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading paths...
                  </p>
                ) : learningPaths.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No learning path generated yet.
                  </p>
                ) : (
                  learningPaths.map((path) => (
                    <button
                      key={path._id}
                      type="button"
                      onClick={() => setActivePath(path)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        activePath?._id === path._id
                          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {path.targetRole}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(path.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!activePath ? (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    No learning path selected
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Generate a learning path to see personalized course
                    recommendations here.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Personalized Path
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {activePath.targetRole}
                    </h2>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {activePath.recommendedCourses?.length || 0} recommended
                      courses
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(activePath._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                {activePath.weakSkills?.length ? (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
                    <h3 className="font-bold text-slate-950 dark:text-white">
                      Skills to Improve
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {activePath.weakSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {activePath.nextSteps?.length ? (
                  <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                    <h3 className="font-bold text-slate-950 dark:text-white">
                      Next Steps
                    </h3>

                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {activePath.nextSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                    Recommended Courses
                  </h3>

                  {activePath.recommendedCourses?.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                      No course recommendations found yet. Add more published
                      courses with categories or skills.
                    </p>
                  ) : (
                    activePath.recommendedCourses.map((item) => {
                      const course = item.course;

                      if (!course) return null;

                      return (
                        <div
                          key={course._id}
                          className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                                  Priority {item.priority}/5
                                </span>

                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {course.category}
                                </span>

                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold capitalize text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                  {course.level}
                                </span>
                              </div>

                              <h4 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">
                                {course.title}
                              </h4>

                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                {course.description}
                              </p>

                              <p className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {item.reason}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span>{formatPrice(course.price)}</span>
                                <span>
                                  ★ {(course.averageRating || 0).toFixed(1)}
                                </span>
                                <span>{course.numReviews || 0} reviews</span>
                              </div>
                            </div>

                            <Link
                              to={`/courses/${course._id}`}
                              className="inline-flex justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              View Course
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LearningPathPage;
