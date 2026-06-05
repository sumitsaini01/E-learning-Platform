import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Learning Path Recommendations
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Recommended courses for your career goal
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          SkillSphere recommends courses using your skill profile, completed
          lessons, passed quizzes, certificates, and enrolled courses.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <form
            onSubmit={handleGenerate}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-zinc-950">
              Generate Path
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Enter your target role and SkillSphere will recommend courses that
              fill your current skill gaps.
            </p>

            <div className="mt-5">
              <label className="block text-sm font-medium text-zinc-800">
                Target Role
              </label>

              <input
                type="text"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Frontend Developer, Backend Developer..."
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isGenerating ? "Generating..." : "Generate Learning Path"}
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Previous Paths
            </h2>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Loading paths...</p>
              ) : learningPaths.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No learning path generated yet.
                </p>
              ) : (
                learningPaths.map((path) => (
                  <button
                    key={path._id}
                    type="button"
                    onClick={() => setActivePath(path)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      activePath?._id === path._id
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="font-medium">{path.targetRole}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(path.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {!activePath ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <h2 className="text-xl font-semibold text-zinc-950">
                No learning path selected
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Generate a learning path to see personalized course
                recommendations here.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    Personalized Path
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {activePath.targetRole}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-600">
                    {activePath.recommendedCourses?.length || 0} recommended
                    courses
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(activePath._id)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>

              {activePath.weakSkills?.length ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="font-semibold text-zinc-950">
                    Skills to Improve
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {activePath.weakSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {activePath.nextSteps?.length ? (
                <div className="mt-6 rounded-xl border border-zinc-200 p-5">
                  <h3 className="font-semibold text-zinc-950">Next Steps</h3>

                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                    {activePath.nextSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-zinc-950">
                  Recommended Courses
                </h3>

                {activePath.recommendedCourses?.length === 0 ? (
                  <p className="rounded-md bg-stone-50 p-4 text-sm text-zinc-600">
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
                        className="rounded-xl border border-zinc-200 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                                Priority {item.priority}/5
                              </span>

                              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold capitalize text-zinc-700">
                                {course.category}
                              </span>

                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold capitalize text-blue-800">
                                {course.level}
                              </span>
                            </div>

                            <h4 className="mt-3 text-lg font-semibold text-zinc-950">
                              {course.title}
                            </h4>

                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                              {course.description}
                            </p>

                            <p className="mt-3 text-sm font-medium text-emerald-700">
                              {item.reason}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
                              <span>{formatPrice(course.price)}</span>
                              <span>
                                ★ {(course.averageRating || 0).toFixed(1)}
                              </span>
                              <span>{course.numReviews || 0} reviews</span>
                            </div>
                          </div>

                          <Link
                            to={`/courses/${course._id}`}
                            className="inline-flex justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
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
    </section>
  );
}

export default LearningPathPage;
