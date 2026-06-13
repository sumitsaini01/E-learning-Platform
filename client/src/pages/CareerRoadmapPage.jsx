import { useEffect, useState } from "react";
import { Map, Trash2 } from "lucide-react";
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
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <Map size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                AI Career Roadmap
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                Plan your technical career path
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Generate a practical roadmap based on your career goal, current
                level, known skills, and weekly time commitment.
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
          <form
            onSubmit={handleGenerate}
            className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Generate Roadmap
            </h2>

            <div className="mt-5 space-y-4">
              <InputField
                label="Career Goal"
                name="careerGoal"
                value={formData.careerGoal}
                onChange={handleChange}
                placeholder="Become a MERN Stack Developer"
              />

              <InputField
                label="Target Role"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                placeholder="Frontend Developer, Backend Developer..."
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Current Level
                </label>

                <select
                  name="currentLevel"
                  value={formData.currentLevel}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Known Skills
                </label>

                <textarea
                  name="knownSkills"
                  value={formData.knownSkills}
                  onChange={handleChange}
                  placeholder="HTML, CSS, JavaScript, React..."
                  className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                />
              </div>

              <InputField
                label="Weekly Time Commitment"
                name="timeCommitment"
                value={formData.timeCommitment}
                onChange={handleChange}
                placeholder="10 hours per week"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isGenerating ? "Generating..." : "Generate Roadmap"}
            </button>

            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Previous Roadmaps
              </h3>

              <div className="mt-3 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading roadmaps...
                  </p>
                ) : roadmaps.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No roadmap generated yet.
                  </p>
                ) : (
                  roadmaps.map((roadmap) => (
                    <button
                      key={roadmap._id}
                      type="button"
                      onClick={() => setActiveRoadmap(roadmap)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        activeRoadmap?._id === roadmap._id
                          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {roadmap.targetRole}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(roadmap.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!activeRoadmap ? (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    No roadmap selected
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Generate your first AI career roadmap to see the plan here.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      {activeRoadmap.currentLevel}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {activeRoadmap.targetRole}
                    </h2>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Goal: {activeRoadmap.careerGoal}
                    </p>

                    {activeRoadmap.estimatedTimeline ? (
                      <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        Timeline: {activeRoadmap.estimatedTimeline}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(activeRoadmap._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                <div className="mt-6 space-y-5">
                  {activeRoadmap.roadmap?.map((step, index) => (
                    <div
                      key={`${step.phase}-${index}`}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            {step.phase}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                            {step.title}
                          </h3>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {step.estimatedWeeks} week
                          {step.estimatedWeeks > 1 ? "s" : ""}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {step.description}
                      </p>

                      {step.skills?.length ? (
                        <div className="mt-4">
                          <p className="text-sm font-bold text-slate-950 dark:text-white">
                            Skills
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {step.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {step.recommendedProjects?.length ? (
                        <div className="mt-4">
                          <p className="text-sm font-bold text-slate-950 dark:text-white">
                            Projects
                          </p>

                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
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
      </div>
    </section>
  );
}

function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
      />
    </div>
  );
}

function InfoList({ title, items = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="font-bold text-slate-950 dark:text-white">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          No items available.
        </p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CareerRoadmapPage;
