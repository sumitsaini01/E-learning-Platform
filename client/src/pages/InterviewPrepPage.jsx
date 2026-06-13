import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Trash2 } from "lucide-react";
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
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <ClipboardList size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                AI Interview Preparation
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                Prepare for your target role and company
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Generate technical, MCQ, coding, and HR interview questions
                using your target job role, company, and experience type.
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
                Generate Interview Prep
              </h2>

              <div className="mt-5 space-y-4">
                <InputField
                  label="Target Job Role"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="Frontend Developer, Data Scientist..."
                />

                <InputField
                  label="Target Company"
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleChange}
                  placeholder="Google, TCS, Infosys, Startup..."
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Experience Type
                  </label>

                  <select
                    name="experienceType"
                    value={formData.experienceType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
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
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isGenerating ? "Generating..." : "Generate Prep"}
              </button>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Previous Prep Sets
              </h2>

              <div className="mt-4 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading...
                  </p>
                ) : interviewPreps.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No interview prep generated yet.
                  </p>
                ) : (
                  interviewPreps.map((prep) => (
                    <button
                      key={prep._id}
                      type="button"
                      onClick={() => setActivePrep(prep)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        activePrep?._id === prep._id
                          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {prep.targetRole}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {prep.targetCompany} • {prep.experienceType}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!activePrep ? (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    No preparation selected
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Generate interview preparation to see questions here.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      {activePrep.experienceType}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {activePrep.targetRole}
                    </h2>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Target Company: {activePrep.targetCompany}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(activePrep._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Trash2 size={16} />
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

                <QuestionSection
                  title="MCQs"
                  questions={groupedQuestions.mcq}
                />

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

function InfoSection({ title, items = [] }) {
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

function QuestionSection({ title, questions = [] }) {
  if (!questions.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">
        {title}
      </h3>

      <div className="mt-4 space-y-4">
        {questions.map((question, index) => (
          <div
            key={`${question.question}-${index}`}
            className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold capitalize text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                {question.type}
              </span>

              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {question.difficulty}
              </span>
            </div>

            <h4 className="mt-3 font-bold text-slate-950 dark:text-white">
              {index + 1}. {question.question}
            </h4>

            {question.options?.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <div
                    key={option}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    {option}
                  </div>
                ))}
              </div>
            ) : null}

            {question.correctAnswer ? (
              <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="font-semibold">Answer:</span>{" "}
                {question.correctAnswer}
              </div>
            ) : null}

            {question.explanation ? (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-950 dark:text-white">
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
