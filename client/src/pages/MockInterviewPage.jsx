import { useEffect, useMemo, useState } from "react";
import { Brain, Building2, Trash2 } from "lucide-react";
import {
  deleteMockInterview,
  getMyMockInterviews,
  startMockInterview,
  submitMockInterviewAnswer,
} from "../services/mockInterviewService";

function MockInterviewPage() {
  const [formData, setFormData] = useState({
    targetRole: "",
    targetCompany: "",
    experienceType: "fresher",
  });

  const [interviews, setInterviews] = useState([]);
  const [activeInterview, setActiveInterview] = useState(null);
  const [answers, setAnswers] = useState({});

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [submittingQuestionId, setSubmittingQuestionId] = useState("");

  const groupedQuestions = useMemo(() => {
    const groups = {
      technical: [],
      coding: [],
      project: [],
      hr: [],
      "system-design": [],
    };

    (activeInterview?.questions || []).forEach((question) => {
      if (groups[question.category]) {
        groups[question.category].push(question);
      }
    });

    return groups;
  }, [activeInterview]);

  const answeredCount =
    activeInterview?.questions?.filter((item) => item.userAnswer?.trim())
      .length || 0;

  const totalQuestions = activeInterview?.questions?.length || 0;

  const loadInterviews = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getMyMockInterviews();

      setInterviews(data.interviews || []);
      setActiveInterview(data.interviews?.[0] || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load mock interviews.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleStartInterview = async (event) => {
    event.preventDefault();

    if (!formData.targetRole.trim() || !formData.targetCompany.trim()) {
      setError("Target role and target company are required.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsStarting(true);

      const data = await startMockInterview({
        targetRole: formData.targetRole.trim(),
        targetCompany: formData.targetCompany.trim(),
        experienceType: formData.experienceType,
      });

      setActiveInterview(data.interview);
      setAnswers({});
      setMessage(data.message || "Mock interview started.");

      await loadInterviews();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to start mock interview.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleSubmitAnswer = async (questionId) => {
    const answer = answers[questionId] || "";

    if (!answer.trim()) {
      setError("Answer is required.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setSubmittingQuestionId(questionId);

      const data = await submitMockInterviewAnswer(
        activeInterview._id,
        questionId,
        answer.trim(),
      );

      setActiveInterview(data.interview);
      setMessage("Answer evaluated successfully.");

      setAnswers((current) => ({
        ...current,
        [questionId]: "",
      }));

      await loadInterviews();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to evaluate answer.");
    } finally {
      setSubmittingQuestionId("");
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    const confirmed = window.confirm("Delete this mock interview?");

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteMockInterview(interviewId);

      setMessage("Mock interview deleted successfully.");
      await loadInterviews();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete interview.");
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <Brain size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                AI Mock Interview
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                Practice interview answers with AI feedback
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Start a company-role based mock interview, answer questions, and
                get AI evaluation with score, feedback, strengths, and
                improvements.
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
              onSubmit={handleStartInterview}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Start Mock Interview
              </h2>

              <div className="mt-5 space-y-4">
                <FormField label="Target Job Role">
                  <input
                    type="text"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    placeholder="Frontend Developer, Data Scientist..."
                    className="input-dark"
                  />
                </FormField>

                <FormField label="Target Company">
                  <input
                    type="text"
                    name="targetCompany"
                    value={formData.targetCompany}
                    onChange={handleChange}
                    placeholder="Google, Infosys, Startup..."
                    className="input-dark"
                  />
                </FormField>

                <FormField label="Experience Type">
                  <select
                    name="experienceType"
                    value={formData.experienceType}
                    onChange={handleChange}
                    className="input-dark"
                  >
                    <option value="fresher">Fresher</option>
                    <option value="entry-level">Entry Level</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </FormField>
              </div>

              <button
                type="submit"
                disabled={isStarting}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isStarting ? "Starting..." : "Start Interview"}
              </button>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Previous Interviews
              </h2>

              <div className="mt-4 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading...
                  </p>
                ) : interviews.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No mock interviews yet.
                  </p>
                ) : (
                  interviews.map((interview) => (
                    <button
                      key={interview._id}
                      type="button"
                      onClick={() => setActiveInterview(interview)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        activeInterview?._id === interview._id
                          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {interview.targetRole}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {interview.targetCompany} • {interview.status}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!activeInterview ? (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <div>
                  <Building2
                    size={34}
                    className="mx-auto text-slate-400 dark:text-slate-600"
                  />

                  <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">
                    No interview selected
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Start a mock interview to view questions here.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      {activeInterview.experienceType}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {activeInterview.targetRole}
                    </h2>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Company: {activeInterview.targetCompany}
                    </p>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Answered {answeredCount} / {totalQuestions}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeInterview.status === "completed" ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Score {activeInterview.overallScore}/10
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        In Progress
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteInterview(activeInterview._id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>

                {activeInterview.overallFeedback ? (
                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
                    <h3 className="font-bold text-slate-950 dark:text-white">
                      Overall Feedback
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-emerald-900 dark:text-emerald-300">
                      {activeInterview.overallFeedback}
                    </p>
                  </div>
                ) : null}

                <QuestionGroup
                  title="Technical Questions"
                  questions={groupedQuestions.technical}
                  answers={answers}
                  submittingQuestionId={submittingQuestionId}
                  onAnswerChange={handleAnswerChange}
                  onSubmitAnswer={handleSubmitAnswer}
                />

                <QuestionGroup
                  title="Coding Questions"
                  questions={groupedQuestions.coding}
                  answers={answers}
                  submittingQuestionId={submittingQuestionId}
                  onAnswerChange={handleAnswerChange}
                  onSubmitAnswer={handleSubmitAnswer}
                />

                <QuestionGroup
                  title="Project Questions"
                  questions={groupedQuestions.project}
                  answers={answers}
                  submittingQuestionId={submittingQuestionId}
                  onAnswerChange={handleAnswerChange}
                  onSubmitAnswer={handleSubmitAnswer}
                />

                <QuestionGroup
                  title="System Design Questions"
                  questions={groupedQuestions["system-design"]}
                  answers={answers}
                  submittingQuestionId={submittingQuestionId}
                  onAnswerChange={handleAnswerChange}
                  onSubmitAnswer={handleSubmitAnswer}
                />

                <QuestionGroup
                  title="HR Questions"
                  questions={groupedQuestions.hr}
                  answers={answers}
                  submittingQuestionId={submittingQuestionId}
                  onAnswerChange={handleAnswerChange}
                  onSubmitAnswer={handleSubmitAnswer}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="mt-2">{children}</div>
    </div>
  );
}

function QuestionGroup({
  title,
  questions = [],
  answers,
  submittingQuestionId,
  onAnswerChange,
  onSubmitAnswer,
}) {
  if (!questions.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">
        {title}
      </h3>

      <div className="mt-4 space-y-5">
        {questions.map((question, index) => {
          const answered = Boolean(question.userAnswer?.trim());

          return (
            <div
              key={question._id}
              className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold capitalize text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                  {question.category}
                </span>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {question.difficulty}
                </span>

                {answered ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Score {question.score}/10
                  </span>
                ) : null}
              </div>

              <h4 className="mt-3 font-bold text-slate-950 dark:text-white">
                {index + 1}. {question.question}
              </h4>

              {answered ? (
                <div className="mt-4 space-y-4">
                  <InfoBox label="Your Answer" value={question.userAnswer} />
                  <InfoBox label="Feedback" value={question.feedback} />

                  <FeedbackList title="Strengths" items={question.strengths} />

                  <FeedbackList
                    title="Improvements"
                    items={question.improvements}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <textarea
                    value={answers[question._id] || ""}
                    onChange={(event) =>
                      onAnswerChange(question._id, event.target.value)
                    }
                    placeholder="Write your answer here..."
                    className="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                  />

                  <button
                    type="button"
                    onClick={() => onSubmitAnswer(question._id)}
                    disabled={submittingQuestionId === question._id}
                    className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {submittingQuestionId === question._id
                      ? "Evaluating..."
                      : "Submit Answer"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">
      <span className="font-semibold text-slate-950 dark:text-white">
        {label}:
      </span>{" "}
      {value}
    </div>
  );
}

function FeedbackList({ title, items = [] }) {
  if (!items?.length) return null;

  return (
    <div>
      <p className="text-sm font-bold text-slate-950 dark:text-white">
        {title}
      </p>

      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default MockInterviewPage;
