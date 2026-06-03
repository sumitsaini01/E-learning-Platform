import { useEffect, useState } from "react";
import {
  deleteCareerRoadmap,
  generateCareerRoadmap,
  getMyCareerRoadmaps,
} from "../services/careerRoadmapService";

function CareerRoadmapPage() {
  const [formData, setFormData] = useState({
    careerGoal: "",
    targetRole: "",
    currentLevel: "beginner",
    knownSkills: "",
    timeCommitment: "",
  });

  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoadmaps = async () => {
    try {
      setIsLoading(true);
      const data = await getMyCareerRoadmaps();
      setRoadmaps(data.roadmaps || []);
      setActiveRoadmap(data.roadmaps?.[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load roadmaps.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!formData.careerGoal.trim() || !formData.targetRole.trim()) {
      setError("Career goal and target role are required.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsGenerating(true);

      const data = await generateCareerRoadmap(formData);

      setActiveRoadmap(data.roadmap);
      setMessage("Career roadmap generated successfully.");

      await loadRoadmaps();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (roadmapId) => {
    const confirmed = window.confirm("Delete this roadmap?");

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteCareerRoadmap(roadmapId);

      setMessage("Roadmap deleted successfully.");
      await loadRoadmaps();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete roadmap.");
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          AI Career Roadmap
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Plan your technical career path
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Generate a practical roadmap based on your career goal, current level,
          known skills, and weekly time commitment.
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

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleGenerate}
          className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-zinc-950">
            Generate Roadmap
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Career Goal
              </label>

              <input
                type="text"
                name="careerGoal"
                value={formData.careerGoal}
                onChange={handleChange}
                placeholder="Become a MERN Stack Developer"
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Target Role
              </label>

              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                placeholder="Frontend Developer, Backend Developer..."
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Current Level
              </label>

              <select
                name="currentLevel"
                value={formData.currentLevel}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Known Skills
              </label>

              <textarea
                name="knownSkills"
                value={formData.knownSkills}
                onChange={handleChange}
                placeholder="HTML, CSS, JavaScript, React..."
                className="mt-2 min-h-24 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Weekly Time Commitment
              </label>

              <input
                type="text"
                name="timeCommitment"
                value={formData.timeCommitment}
                onChange={handleChange}
                placeholder="10 hours per week"
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isGenerating ? "Generating..." : "Generate Roadmap"}
          </button>

          <div className="mt-6 border-t border-zinc-100 pt-5">
            <h3 className="text-sm font-semibold text-zinc-950">
              Previous Roadmaps
            </h3>

            <div className="mt-3 space-y-2">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Loading roadmaps...</p>
              ) : roadmaps.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No roadmap generated yet.
                </p>
              ) : (
                roadmaps.map((roadmap) => (
                  <button
                    key={roadmap._id}
                    type="button"
                    onClick={() => setActiveRoadmap(roadmap)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      activeRoadmap?._id === roadmap._id
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="font-medium">{roadmap.targetRole}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(roadmap.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </form>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {!activeRoadmap ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <h2 className="text-xl font-semibold text-zinc-950">
                No roadmap selected
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Generate your first AI career roadmap to see the plan here.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    {activeRoadmap.currentLevel}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {activeRoadmap.targetRole}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-600">
                    Goal: {activeRoadmap.careerGoal}
                  </p>

                  {activeRoadmap.estimatedTimeline ? (
                    <p className="mt-1 text-sm font-medium text-emerald-700">
                      Timeline: {activeRoadmap.estimatedTimeline}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(activeRoadmap._id)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>

              <div className="mt-6 space-y-5">
                {activeRoadmap.roadmap?.map((step, index) => (
                  <div
                    key={`${step.phase}-${index}`}
                    className="rounded-xl border border-zinc-200 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          {step.phase}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                          {step.title}
                        </h3>
                      </div>

                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                        {step.estimatedWeeks} week
                        {step.estimatedWeeks > 1 ? "s" : ""}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {step.description}
                    </p>

                    {step.skills?.length ? (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-zinc-900">
                          Skills
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {step.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {step.recommendedProjects?.length ? (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-zinc-900">
                          Projects
                        </p>

                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                          {step.recommendedProjects.map((project) => (
                            <li key={project}>{project}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <InfoList title="Tools" items={activeRoadmap.tools} />
                <InfoList
                  title="Interview Topics"
                  items={activeRoadmap.interviewTopics}
                />
                <InfoList
                  title="Portfolio Projects"
                  items={activeRoadmap.portfolioProjects}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoList({ title, items = [] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-stone-50 p-5">
      <h3 className="font-semibold text-zinc-950">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No items available.</p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CareerRoadmapPage;
