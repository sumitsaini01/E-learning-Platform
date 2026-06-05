import { useEffect, useState } from "react";
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
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Job Readiness Score
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Check your readiness for a target role
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          SkillSphere calculates readiness using your skills, certificates,
          course progress, quiz performance, and AI mock interview results.
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
              Generate Score
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Enter the job role you are preparing for.
            </p>

            <div className="mt-5">
              <label className="block text-sm font-medium text-zinc-800">
                Target Role
              </label>

              <input
                type="text"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Frontend Developer, Data Scientist..."
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isGenerating ? "Calculating..." : "Generate Readiness Score"}
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Previous Reports
            </h2>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Loading reports...</p>
              ) : reports.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No readiness reports yet.
                </p>
              ) : (
                reports.map((report) => (
                  <button
                    key={report._id}
                    type="button"
                    onClick={() => setActiveReport(report)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      activeReport?._id === report._id
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="font-medium">{report.targetRole}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {report.overallScore}% •{" "}
                      {levelLabels[report.level] || report.level}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {!activeReport ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <h2 className="text-xl font-semibold text-zinc-950">
                No report selected
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Generate a readiness report to see your score here.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    {levelLabels[activeReport.level] || activeReport.level}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {activeReport.targetRole}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-600">
                    Generated on{" "}
                    {new Date(activeReport.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(activeReport._id)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                  Overall Readiness
                </p>

                <h3 className="mt-2 text-6xl font-bold text-emerald-800">
                  {activeReport.overallScore}%
                </h3>

                <p className="mt-2 text-sm font-semibold text-emerald-900">
                  {levelLabels[activeReport.level] || activeReport.level}
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {activeReport.breakdown?.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-zinc-950">
                        {item.label}
                      </h4>

                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-800">
                        {item.score}%
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-600">
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
    </section>
  );
}

function InfoList({ title, items = [] }) {
  if (!items.length) return null;

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 p-5">
      <h3 className="font-semibold text-zinc-950">{title}</h3>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default JobReadinessPage;
