import { useEffect, useMemo, useState } from "react";
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
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          AI Mock Interview
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Practice interview answers with AI feedback
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Start a company-role based mock interview, answer questions, and get
          AI evaluation with score, feedback, strengths, and improvements.
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
            onSubmit={handleStartInterview}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-zinc-950">
              Start Mock Interview
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
                  placeholder="Google, Infosys, Startup..."
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
              disabled={isStarting}
              className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isStarting ? "Starting..." : "Start Interview"}
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Previous Interviews
            </h2>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
              ) : interviews.length === 0 ? (
                <p className="text-sm text-zinc-500">No mock interviews yet.</p>
              ) : (
                interviews.map((interview) => (
                  <button
                    key={interview._id}
                    type="button"
                    onClick={() => setActiveInterview(interview)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      activeInterview?._id === interview._id
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="font-medium">{interview.targetRole}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {interview.targetCompany} • {interview.status}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {!activeInterview ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <h2 className="text-xl font-semibold text-zinc-950">
                No interview selected
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Start a mock interview to view questions here.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    {activeInterview.experienceType}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {activeInterview.targetRole}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-600">
                    Company: {activeInterview.targetCompany}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Answered {answeredCount} / {totalQuestions}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeInterview.status === "completed" ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                      Score {activeInterview.overallScore}/10
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                      In Progress
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteInterview(activeInterview._id)}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {activeInterview.overallFeedback ? (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="font-semibold text-zinc-950">
                    Overall Feedback
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-emerald-900">
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
    </section>
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
      <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>

      <div className="mt-4 space-y-5">
        {questions.map((question, index) => {
          const answered = Boolean(question.userAnswer?.trim());

          return (
            <div
              key={question._id}
              className="rounded-xl border border-zinc-200 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold capitalize text-emerald-800">
                  {question.category}
                </span>

                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold capitalize text-zinc-700">
                  {question.difficulty}
                </span>

                {answered ? (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    Score {question.score}/10
                  </span>
                ) : null}
              </div>

              <h4 className="mt-3 font-semibold text-zinc-950">
                {index + 1}. {question.question}
              </h4>

              {answered ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-700">
                    <span className="font-semibold">Your Answer:</span>{" "}
                    {question.userAnswer}
                  </div>

                  <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    <span className="font-semibold">Feedback:</span>{" "}
                    {question.feedback}
                  </div>

                  {question.strengths?.length ? (
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Strengths
                      </p>

                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                        {question.strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {question.improvements?.length ? (
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Improvements
                      </p>

                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                        {question.improvements.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4">
                  <textarea
                    value={answers[question._id] || ""}
                    onChange={(event) =>
                      onAnswerChange(question._id, event.target.value)
                    }
                    placeholder="Write your answer here..."
                    className="min-h-28 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />

                  <button
                    type="button"
                    onClick={() => onSubmitAnswer(question._id)}
                    disabled={submittingQuestionId === question._id}
                    className="mt-3 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
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

export default MockInterviewPage;
