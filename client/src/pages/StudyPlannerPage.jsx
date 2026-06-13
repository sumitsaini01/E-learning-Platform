import { useEffect, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
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
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <CalendarDays size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                AI Study Planner
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                Create a focused learning schedule
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Generate a day-wise study plan using your goal, target role,
                available days, daily study time, and current level.
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
                Generate Study Plan
              </h2>

              <div className="mt-5 space-y-4">
                <InputField
                  label="Goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="Prepare for MERN interview"
                />

                <InputField
                  label="Target Role"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="Frontend Developer, Full Stack Developer..."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Duration Days"
                    name="durationDays"
                    type="number"
                    min="1"
                    max="180"
                    value={formData.durationDays}
                    onChange={handleChange}
                  />

                  <InputField
                    label="Hours / Day"
                    name="hoursPerDay"
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={formData.hoursPerDay}
                    onChange={handleChange}
                  />
                </div>

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
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isGenerating ? "Generating..." : "Generate Plan"}
              </button>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Previous Plans
              </h2>

              <div className="mt-4 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading plans...
                  </p>
                ) : plans.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No study plans generated yet.
                  </p>
                ) : (
                  plans.map((plan) => (
                    <button
                      key={plan._id}
                      type="button"
                      onClick={() => setActivePlan(plan)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        activePlan?._id === plan._id
                          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {plan.goal}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {plan.durationDays} days • {plan.hoursPerDay} hrs/day
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!activePlan ? (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    No study plan selected
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Generate a study plan to view your day-wise learning
                    schedule.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      {activePlan.currentLevel}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {activePlan.goal}
                    </h2>

                    {activePlan.targetRole ? (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Target Role: {activePlan.targetRole}
                      </p>
                    ) : null}

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {activePlan.durationDays} days • {activePlan.hoursPerDay}{" "}
                      hrs/day
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(activePlan._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                {activePlan.finalOutcome ? (
                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40">
                    <h3 className="font-bold text-slate-950 dark:text-white">
                      Final Outcome
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-blue-900 dark:text-blue-300">
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
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                    Day-wise Plan
                  </h3>

                  {activePlan.plan?.map((day) => (
                    <div
                      key={`${day.day}-${day.title}`}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            Day {day.day}
                          </p>

                          <h4 className="mt-1 font-bold text-slate-950 dark:text-white">
                            {day.title}
                          </h4>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {day.estimatedHours} hrs
                        </span>
                      </div>

                      <InfoList title="Tasks" items={day.tasks} compact />
                      <InfoList title="Topics" items={day.topics} compact />
                      <InfoList
                        title="Resources"
                        items={day.resources}
                        compact
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  min,
  max,
  step,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type={type}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
      />
    </div>
  );
}

function InfoList({ title, items = [], compact = false }) {
  if (!items?.length) return null;

  return (
    <div
      className={
        compact
          ? "mt-4"
          : "mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
      }
    >
      <h3 className="font-bold text-slate-950 dark:text-white">{title}</h3>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default StudyPlannerPage;
