import { useEffect, useState } from "react";
import { Briefcase, Trash2 } from "lucide-react";
import {
  deleteJobReadiness,
  generateJobReadiness,
  getMyJobReadinessReports,
} from "../services/jobReadinessService";

const levelLabels = {
  "not-ready": "Not Ready",
  "getting-ready": "Getting Ready",
  "job-ready": "Job Ready",
  "strong-candidate": "Strong Candidate",
};

function JobReadinessPage() {
  const [targetRole, setTargetRole] = useState("");
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadReports = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getMyJobReadinessReports();

      setReports(data.reports || []);
      setActiveReport(data.reports?.[0] || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load readiness reports.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
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

      const data = await generateJobReadiness({
        targetRole: targetRole.trim(),
      });

      setActiveReport(data.readiness);
      setMessage(data.message || "Job readiness score generated.");

      await loadReports();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate job readiness score.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (reportId) => {
    const confirmed = window.confirm("Delete this readiness report?");

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteJobReadiness(reportId);

      setMessage("Readiness report deleted successfully.");
      await loadReports();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete readiness report.",
      );
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <Briefcase size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Job Readiness Score
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                Check your readiness for a target role
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                SkillSphere calculates readiness using your skills,
                certificates, course progress, quiz performance, and AI mock
                interview results.
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
                Generate Score
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Enter the job role you are preparing for.
              </p>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Target Role
                </label>

                <input
                  type="text"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="Frontend Developer, Data Scientist..."
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isGenerating ? "Calculating..." : "Generate Readiness Score"}
              </button>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Previous Reports
              </h2>

              <div className="mt-4 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading reports...
                  </p>
                ) : reports.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No readiness reports yet.
                  </p>
                ) : (
                  reports.map((report) => (
                    <button
                      key={report._id}
                      type="button"
                      onClick={() => setActiveReport(report)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        activeReport?._id === report._id
                          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {report.targetRole}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {report.overallScore}% •{" "}
                        {levelLabels[report.level] || report.level}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!activeReport ? (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    No report selected
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Generate a readiness report to see your score here.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      {levelLabels[activeReport.level] || activeReport.level}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {activeReport.targetRole}
                    </h2>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Generated on{" "}
                      {new Date(activeReport.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(activeReport._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-900 dark:bg-blue-950/40">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Overall Readiness
                  </p>

                  <h3 className="mt-2 text-6xl font-bold text-blue-700 dark:text-blue-300">
                    {activeReport.overallScore}%
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
                    {levelLabels[activeReport.level] || activeReport.level}
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {activeReport.breakdown?.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-950 dark:text-white">
                          {item.label}
                        </h4>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {item.score}%
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>

                <InfoList title="Strengths" items={activeReport.strengths} />
                <InfoList title="Gaps" items={activeReport.gaps} />
                <InfoList
                  title="Recommendations"
                  items={activeReport.recommendations}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoList({ title, items = [] }) {
  if (!items.length) return null;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h3 className="font-bold text-slate-950 dark:text-white">{title}</h3>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default JobReadinessPage;
