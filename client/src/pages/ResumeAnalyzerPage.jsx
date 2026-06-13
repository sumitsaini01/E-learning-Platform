import { useEffect, useState } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import {
  analyzeResume,
  deleteResumeAnalysis,
  getMyResumeAnalyses,
} from "../services/resumeAnalysisService";

function ResumeAnalyzerPage() {
  const [targetRole, setTargetRole] = useState("");
  const [resume, setResume] = useState(null);

  const [analyses, setAnalyses] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadAnalyses = async () => {
    try {
      setError("");

      const data = await getMyResumeAnalyses();

      setAnalyses(data.analyses || []);
      setActiveAnalysis(data.analyses?.[0] || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load resume analyses.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleAnalyze = async (event) => {
    event.preventDefault();

    if (!targetRole.trim()) {
      setError("Target role is required.");
      return;
    }

    if (!resume) {
      setError("Please upload a resume.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsAnalyzing(true);

      const data = await analyzeResume({
        targetRole,
        resume,
      });

      setMessage(data.message || "Resume analyzed successfully.");

      setTargetRole("");
      setResume(null);

      await loadAnalyses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (analysisId) => {
    const confirmed = window.confirm("Delete this resume analysis?");

    if (!confirmed) return;

    try {
      await deleteResumeAnalysis(analysisId);

      setMessage("Resume analysis deleted.");

      await loadAnalyses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete analysis.");
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <FileText size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                AI Resume Analyzer
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                Analyze your resume with AI
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Upload your resume and receive ATS score, keyword gaps, project
                suggestions, strengths, weaknesses, and improvement
                recommendations.
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
              onSubmit={handleAnalyze}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Upload Resume
              </h2>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Target Role
                </label>

                <input
                  type="text"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="Frontend Developer"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Resume
                </label>

                <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-blue-600 dark:hover:bg-blue-950/30">
                  <UploadCloud
                    size={28}
                    className="text-blue-600 dark:text-blue-400"
                  />

                  <span className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {resume ? resume.name : "Upload PDF or DOCX"}
                  </span>

                  <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Supported formats: PDF, DOCX
                  </span>

                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(event) =>
                      setResume(event.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
              </button>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Previous Analyses
              </h2>

              <div className="mt-4 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading...
                  </p>
                ) : analyses.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No analyses yet.
                  </p>
                ) : (
                  analyses.map((analysis) => (
                    <button
                      key={analysis._id}
                      type="button"
                      onClick={() => setActiveAnalysis(analysis)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        activeAnalysis?._id === analysis._id
                          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {analysis.targetRole}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        ATS Score: {analysis.atsScore}/100
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!activeAnalysis ? (
              <div className="flex min-h-80 items-center justify-center text-center text-slate-500 dark:text-slate-400">
                Select a resume analysis.
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      ATS Score
                    </p>

                    <h2 className="mt-2 text-5xl font-bold text-blue-600 dark:text-blue-400">
                      {activeAnalysis.atsScore}/100
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(activeAnalysis._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                <div className="mt-8 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                  <h3 className="font-bold text-slate-950 dark:text-white">
                    Summary
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {activeAnalysis.summary}
                  </p>
                </div>

                <ResumeList
                  title="Strengths"
                  items={activeAnalysis.strengths}
                />

                <ResumeList
                  title="Weaknesses"
                  items={activeAnalysis.weaknesses}
                />

                <ResumeList
                  title="Missing Keywords"
                  items={activeAnalysis.missingKeywords}
                />

                <ResumeList
                  title="Project Suggestions"
                  items={activeAnalysis.projectSuggestions}
                />

                <ResumeList
                  title="Improvement Tips"
                  items={activeAnalysis.improvementTips}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResumeList({ title, items = [] }) {
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

export default ResumeAnalyzerPage;
