import { useEffect, useMemo, useState } from "react";
import {
  deleteInterviewPrep,
  generateInterviewPrep,
  getMyInterviewPreps,
} from "../services/interviewPrepService";

function InterviewPrepPage() {
  const [formData, setFormData] = useState({
    targetRole: "",
    targetCompany: "",
    experienceType: "fresher",
  });

  const [interviewPreps, setInterviewPreps] = useState([]);
  const [activePrep, setActivePrep] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const groupedQuestions = useMemo(() => {
    const groups = {
      technical: [],
      mcq: [],
      coding: [],
      hr: [],
    };

    (activePrep?.questions || []).forEach((question) => {
      if (groups[question.type]) {
        groups[question.type].push(question);
      }
    });

    return groups;
  }, [activePrep]);

  const loadInterviewPreps = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getMyInterviewPreps();

      setInterviewPreps(data.interviewPreps || []);
      setActivePrep(data.interviewPreps?.[0] || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load interview preparation.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInterviewPreps();
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

    if (!formData.targetRole.trim() || !formData.targetCompany.trim()) {
      setError("Target role and target company are required.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsGenerating(true);

      const data = await generateInterviewPrep({
        targetRole: formData.targetRole.trim(),
        targetCompany: formData.targetCompany.trim(),
        experienceType: formData.experienceType,
      });

      setActivePrep(data.interviewPrep);
      setMessage(data.message || "Interview preparation generated.");

      await loadInterviewPreps();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate interview preparation.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (prepId) => {
    const confirmed = window.confirm("Delete this interview preparation?");

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteInterviewPrep(prepId);

      setMessage("Interview preparation deleted successfully.");
      await loadInterviewPreps();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete interview preparation.",
      );
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          AI Interview Preparation
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Prepare for your target role and company
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Generate technical, MCQ, coding, and HR interview questions using your
          target job role, company, and experience type.
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
              Generate Interview Prep
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  Target Job Role
                </label>

                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="Frontend Developer, Data Scientist..."
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  Target Company
                </label>

                <input
                  type="text"
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleChange}
                  placeholder="Google, TCS, Infosys, Startup..."
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  Experience Type
                </label>

                <select
                  name="experienceType"
                  value={formData.experienceType}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="fresher">Fresher</option>
                  <option value="entry-level">Entry Level</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isGenerating ? "Generating..." : "Generate Prep"}
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Previous Prep Sets
            </h2>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
              ) : interviewPreps.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No interview prep generated yet.
                </p>
              ) : (
                interviewPreps.map((prep) => (
                  <button
                    key={prep._id}
                    type="button"
                    onClick={() => setActivePrep(prep)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      activePrep?._id === prep._id
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="font-medium">{prep.targetRole}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {prep.targetCompany} • {prep.experienceType}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {!activePrep ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <h2 className="text-xl font-semibold text-zinc-950">
                No preparation selected
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Generate interview preparation to see questions here.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    {activePrep.experienceType}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {activePrep.targetRole}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-600">
                    Target Company: {activePrep.targetCompany}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(activePrep._id)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>

              <InfoSection
                title="Important Topics"
                items={activePrep.importantTopics}
              />

              <InfoSection
                title="Preparation Tips"
                items={activePrep.preparationTips}
              />

              <QuestionSection
                title="Technical Questions"
                questions={groupedQuestions.technical}
              />

              <QuestionSection title="MCQs" questions={groupedQuestions.mcq} />

              <QuestionSection
                title="Coding / Problem Solving"
                questions={groupedQuestions.coding}
              />

              <QuestionSection
                title="HR / Behavioral Questions"
                questions={groupedQuestions.hr}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoSection({ title, items = [] }) {
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

function QuestionSection({ title, questions = [] }) {
  if (!questions.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>

      <div className="mt-4 space-y-4">
        {questions.map((question, index) => (
          <div
            key={`${question.question}-${index}`}
            className="rounded-xl border border-zinc-200 p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold capitalize text-emerald-800">
                {question.type}
              </span>

              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold capitalize text-zinc-700">
                {question.difficulty}
              </span>
            </div>

            <h4 className="mt-3 font-semibold text-zinc-950">
              {index + 1}. {question.question}
            </h4>

            {question.options?.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <div
                    key={option}
                    className="rounded-md border border-zinc-200 bg-stone-50 px-3 py-2 text-sm text-zinc-700"
                  >
                    {option}
                  </div>
                ))}
              </div>
            ) : null}

            {question.correctAnswer ? (
              <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <span className="font-semibold">Answer:</span>{" "}
                {question.correctAnswer}
              </div>
            ) : null}

            {question.explanation ? (
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                <span className="font-semibold text-zinc-800">
                  Explanation:
                </span>{" "}
                {question.explanation}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InterviewPrepPage;
