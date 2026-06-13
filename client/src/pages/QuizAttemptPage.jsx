import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getQuizById,
  startQuizAttempt,
  submitQuizAttempt,
} from "../services/quizService";

function QuizAttemptPage() {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [review, setReview] = useState([]);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    let shouldUpdate = true;

    const loadQuizAndStartAttempt = async () => {
      try {
        setError("");

        const quizData = await getQuizById(quizId);
        const attemptData = await startQuizAttempt(quizId);

        if (!shouldUpdate) return;

        setQuiz(quizData.quiz);
        setAttempt(attemptData.attempt);

        if (attemptData.attempt?.expiresAt) {
          const remainingSeconds = Math.max(
            Math.floor(
              (new Date(attemptData.attempt.expiresAt).getTime() - Date.now()) /
                1000,
            ),
            0,
          );

          setTimeLeft(remainingSeconds);
        }
      } catch (err) {
        if (!shouldUpdate) return;

        setError(err.response?.data?.message || "Unable to load quiz.");
      } finally {
        if (shouldUpdate) setIsLoading(false);
      }
    };

    loadQuizAndStartAttempt();

    return () => {
      shouldUpdate = false;
    };
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || result) return;

    if (timeLeft <= 0 && !hasAutoSubmitted) {
      setHasAutoSubmitted(true);
      handleSubmit(null, true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, result, hasAutoSubmitted]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const totalQuestions = quiz?.questions?.length || 0;
  const canSubmit = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSelectAnswer = (questionId, selectedOptionIndex) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: selectedOptionIndex,
    }));
  };

  const handleSubmit = async (event, isAutoSubmit = false) => {
    event?.preventDefault();

    if (!attempt?._id) {
      setError("Quiz attempt was not started properly.");
      return;
    }

    if (!canSubmit && !isAutoSubmit) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        }),
      );

      const data = await submitQuizAttempt(
        quizId,
        attempt._id,
        formattedAnswers,
      );

      setResult(data.result);
      setReview(data.review || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionStyle = (questionReview, optionIndex) => {
    const isSelected = questionReview.selectedOptionIndex === optionIndex;
    const isCorrect = questionReview.correctOptionIndex === optionIndex;

    if (isCorrect) {
      return "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    }

    if (isSelected && !questionReview.isCorrect) {
      return "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300";
    }

    return "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300";
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-6 h-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-10 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </section>
    );
  }

  if (error && !quiz) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/40">
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">
          {error}
        </p>

        <Link
          to="/dashboard/student"
          className="mt-5 inline-flex rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Back to Dashboard
        </Link>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Quiz not found
        </h2>

        <Link
          to="/dashboard/student"
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Quiz Attempt
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          {quiz.title}
        </h1>

        {quiz.description ? (
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {quiz.description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Badge>{totalQuestions} questions</Badge>
          <Badge variant="success">Passing {quiz.passingPercentage}%</Badge>

          {quiz.timeLimitMinutes > 0 ? (
            <Badge variant="blue">
              Time Left:{" "}
              {timeLeft !== null
                ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
                : `${quiz.timeLimitMinutes} min`}
            </Badge>
          ) : null}
        </div>
      </div>

      {result ? (
        <>
          <div
            className={`rounded-3xl border p-6 text-center shadow-sm ${
              result.passed
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
            }`}
          >
            <p
              className={`text-sm font-semibold uppercase tracking-wide ${
                result.passed
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {result.passed ? "Passed" : "Not Passed"}
            </p>

            <h2 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
              {result.percentage}%
            </h2>

            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Score: {result.score} / {result.totalPoints}
            </p>

            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Passing requirement: {result.passingPercentage}%
            </p>

            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Attempt #{result.attemptNumber}
            </p>

            <Link
              to="/dashboard/student"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Answer Review
            </h2>

            <div className="mt-5 space-y-5">
              {review.map((questionReview, questionIndex) => (
                <div
                  key={questionReview.questionId}
                  className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Question {questionIndex + 1}
                      </p>

                      <h3 className="mt-2 font-bold text-slate-950 dark:text-white">
                        {questionReview.questionText}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        questionReview.isCorrect
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      }`}
                    >
                      {questionReview.isCorrect ? "Correct" : "Wrong"} •{" "}
                      {questionReview.pointsEarned}/{questionReview.points}{" "}
                      marks
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {questionReview.options.map((option, optionIndex) => {
                      const isSelected =
                        questionReview.selectedOptionIndex === optionIndex;
                      const isCorrect =
                        questionReview.correctOptionIndex === optionIndex;

                      return (
                        <div
                          key={optionIndex}
                          className={`rounded-xl border p-3 text-sm ${getOptionStyle(
                            questionReview,
                            optionIndex,
                          )}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span>{option}</span>

                            <div className="flex gap-2">
                              {isSelected ? (
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  Your answer
                                </span>
                              ) : null}

                              {isCorrect ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                  Correct answer
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {questionReview.explanation ? (
                    <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                      <span className="font-semibold">Explanation:</span>{" "}
                      {questionReview.explanation}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Answered {answeredCount} of {totalQuestions} questions
          </div>

          {quiz.questions.map((question, questionIndex) => (
            <div
              key={question._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  Question {questionIndex + 1}
                </h2>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {question.points || 1} mark
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {question.questionText}
              </p>

              <div className="mt-5 space-y-3">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                      answers[question._id] === optionIndex
                        ? "border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                        : "border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question._id}
                      checked={answers[question._id] === optionIndex}
                      onChange={() =>
                        handleSelectAnswer(question._id, optionIndex)
                      }
                    />

                    <span className="text-slate-700 dark:text-slate-300">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting || (!canSubmit && timeLeft !== 0)}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </form>
      )}
    </section>
  );
}

function Badge({ children, variant = "default" }) {
  const variants = {
    default:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export default QuizAttemptPage;
