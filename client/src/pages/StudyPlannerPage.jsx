import { useEffect, useState } from "react";
import {
  deleteStudyPlan,
  generateStudyPlan,
  getMyStudyPlans,
} from "../services/studyPlannerService";

function StudyPlannerPage() {
  const [formData, setFormData] = useState({
    goal: "",
    targetRole: "",
    durationDays: 30,
    hoursPerDay: 2,
    currentLevel: "beginner",
  });

  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadPlans = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getMyStudyPlans();

      setPlans(data.plans || []);
      setActivePlan(data.plans?.[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load study plans.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
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

    if (!formData.goal.trim()) {
      setError("Goal is required.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsGenerating(true);

      const data = await generateStudyPlan({
        goal: formData.goal.trim(),
        targetRole: formData.targetRole.trim(),
        durationDays: Number(formData.durationDays),
        hoursPerDay: Number(formData.hoursPerDay),
        currentLevel: formData.currentLevel,
      });

      setActivePlan(data.studyPlan);
      setMessage(data.message || "Study plan generated successfully.");

      await loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate study plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (planId) => {
    const confirmed = window.confirm("Delete this study plan?");

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteStudyPlan(planId);

      setMessage("Study plan deleted successfully.");
      await loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete study plan.");
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          AI Study Planner
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Create a focused learning schedule
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Generate a day-wise study plan using your goal, target role, available
          days, daily study time, and current level.
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
              Generate Study Plan
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  Goal
                </label>

                <input
                  type="text"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="Prepare for MERN interview"
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
                  placeholder="Frontend Developer, Full Stack Developer..."
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-800">
                    Duration Days
                  </label>

                  <input
                    type="number"
                    name="durationDays"
                    min="1"
                    max="180"
                    value={formData.durationDays}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-800">
                    Hours / Day
                  </label>

                  <input
                    type="number"
                    name="hoursPerDay"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={formData.hoursPerDay}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
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
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isGenerating ? "Generating..." : "Generate Plan"}
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Previous Plans
            </h2>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Loading plans...</p>
              ) : plans.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No study plans generated yet.
                </p>
              ) : (
                plans.map((plan) => (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => setActivePlan(plan)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      activePlan?._id === plan._id
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="font-medium">{plan.goal}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {plan.durationDays} days • {plan.hoursPerDay} hrs/day
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {!activePlan ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <h2 className="text-xl font-semibold text-zinc-950">
                No study plan selected
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Generate a study plan to view your day-wise learning schedule.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    {activePlan.currentLevel}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {activePlan.goal}
                  </h2>

                  {activePlan.targetRole ? (
                    <p className="mt-2 text-sm text-zinc-600">
                      Target Role: {activePlan.targetRole}
                    </p>
                  ) : null}

                  <p className="mt-2 text-sm text-zinc-500">
                    {activePlan.durationDays} days • {activePlan.hoursPerDay}{" "}
                    hrs/day
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(activePlan._id)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>

              {activePlan.finalOutcome ? (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="font-semibold text-zinc-950">Final Outcome</h3>

                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    {activePlan.finalOutcome}
                  </p>
                </div>
              ) : null}

              <InfoList title="Milestones" items={activePlan.milestones} />

              <InfoList
                title="Revision Strategy"
                items={activePlan.revisionStrategy}
              />

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-zinc-950">
                  Day-wise Plan
                </h3>

                {activePlan.plan?.map((day) => (
                  <div
                    key={`${day.day}-${day.title}`}
                    className="rounded-xl border border-zinc-200 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          Day {day.day}
                        </p>

                        <h4 className="mt-1 font-semibold text-zinc-950">
                          {day.title}
                        </h4>
                      </div>

                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                        {day.estimatedHours} hrs
                      </span>
                    </div>

                    <InfoList title="Tasks" items={day.tasks} compact />
                    <InfoList title="Topics" items={day.topics} compact />
                    <InfoList title="Resources" items={day.resources} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoList({ title, items = [], compact = false }) {
  if (!items?.length) return null;

  return (
    <div
      className={
        compact ? "mt-4" : "mt-6 rounded-xl border border-zinc-200 p-5"
      }
    >
      <h3 className="font-semibold text-zinc-950">{title}</h3>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default StudyPlannerPage;
