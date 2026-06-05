import { useEffect, useState } from "react";
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
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          AI Resume Analyzer
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Analyze your resume with AI
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Upload your resume and receive ATS score, keyword gaps, project
          suggestions, strengths, weaknesses, and improvement recommendations.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <form
            onSubmit={handleAnalyze}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-zinc-950">
              Upload Resume
            </h2>

            <div className="mt-5">
              <label className="block text-sm font-medium text-zinc-800">
                Target Role
              </label>

              <input
                type="text"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Frontend Developer"
                className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-800">
                Resume (PDF/DOCX)
              </label>

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(event) => setResume(event.target.files?.[0] || null)}
                className="mt-2 w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Previous Analyses
            </h2>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
              ) : analyses.length === 0 ? (
                <p className="text-sm text-zinc-500">No analyses yet.</p>
              ) : (
                analyses.map((analysis) => (
                  <button
                    key={analysis._id}
                    type="button"
                    onClick={() => setActiveAnalysis(analysis)}
                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                  >
                    <p className="font-medium">{analysis.targetRole}</p>

                    <p className="text-xs text-zinc-500">
                      ATS Score: {analysis.atsScore}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {!activeAnalysis ? (
            <div className="text-center text-zinc-500">
              Select a resume analysis.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    ATS Score
                  </p>

                  <h2 className="mt-2 text-5xl font-bold text-emerald-700">
                    {activeAnalysis.atsScore}/100
                  </h2>
                </div>

                <button
                  onClick={() => handleDelete(activeAnalysis._id)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Delete
                </button>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-zinc-950">Summary</h3>

                <p className="mt-2 text-sm text-zinc-600">
                  {activeAnalysis.summary}
                </p>
              </div>

              <ResumeList title="Strengths" items={activeAnalysis.strengths} />

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
    </section>
  );
}

function ResumeList({ title, items = [] }) {
  if (!items.length) return null;

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-zinc-950">{title}</h3>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default ResumeAnalyzerPage;
