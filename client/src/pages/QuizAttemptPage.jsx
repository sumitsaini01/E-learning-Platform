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
        if (shouldUpdate) {
          setIsLoading(false);
        }
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

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

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
      return "border-emerald-300 bg-emerald-50 text-emerald-900";
    }

    if (isSelected && !questionReview.isCorrect) {
      return "border-red-300 bg-red-50 text-red-900";
    }

    return "border-zinc-200 bg-white text-zinc-700";
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 rounded bg-zinc-200" />
          <div className="mt-6 h-32 rounded bg-zinc-200" />
          <div className="mt-5 h-10 rounded bg-zinc-200" />
        </div>
      </section>
    );
  }

  if (error && !quiz) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-800">{error}</p>

        <Link
          to="/dashboard/student"
          className="mt-5 inline-flex rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Back to Dashboard
        </Link>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">Quiz not found</h2>

        <Link
          to="/dashboard/student"
          className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Back to Dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Quiz Attempt
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          {quiz.title}
        </h1>

        {quiz.description ? (
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {quiz.description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
            {totalQuestions} questions
          </span>

          <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
            Passing {quiz.passingPercentage}%
          </span>

          {quiz.timeLimitMinutes > 0 ? (
            <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800">
              Time Left:{" "}
              {timeLeft !== null
                ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
                : `${quiz.timeLimitMinutes} min`}
            </span>
          ) : null}
        </div>
      </div>

      {result ? (
        <>
          <div
            className={`rounded-lg border p-6 text-center shadow-sm ${
              result.passed
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p
              className={`text-sm font-medium uppercase tracking-wide ${
                result.passed ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {result.passed ? "Passed" : "Not Passed"}
            </p>

            <h2 className="mt-2 text-4xl font-semibold text-zinc-950">
              {result.percentage}%
            </h2>

            <p className="mt-3 text-sm text-zinc-700">
              Score: {result.score} / {result.totalPoints}
            </p>

            <p className="mt-1 text-sm text-zinc-700">
              Passing requirement: {result.passingPercentage}%
            </p>

            <p className="mt-1 text-sm text-zinc-700">
              Attempt #{result.attemptNumber}
            </p>

            <Link
              to="/dashboard/student"
              className="mt-6 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-950">
              Answer Review
            </h2>

            <div className="mt-5 space-y-5">
              {review.map((questionReview, questionIndex) => (
                <div
                  key={questionReview.questionId}
                  className="rounded-lg border border-zinc-200 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Question {questionIndex + 1}
                      </p>

                      <h3 className="mt-2 font-semibold text-zinc-950">
                        {questionReview.questionText}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        questionReview.isCorrect
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
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
                          className={`rounded-md border p-3 text-sm ${getOptionStyle(
                            questionReview,
                            optionIndex,
                          )}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span>{option}</span>

                            <div className="flex gap-2">
                              {isSelected ? (
                                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                                  Your answer
                                </span>
                              ) : null}

                              {isCorrect ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
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
                    <div className="mt-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
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
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
            Answered {answeredCount} of {totalQuestions} questions
          </div>

          {quiz.questions.map((question, questionIndex) => (
            <div
              key={question._id}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Question {questionIndex + 1}
                </h2>

                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {question.points || 1} mark
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-700">
                {question.questionText}
              </p>

              <div className="mt-5 space-y-3">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition ${
                      answers[question._id] === optionIndex
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-zinc-200 bg-white hover:border-emerald-200"
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

                    <span className="text-zinc-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting || (!canSubmit && timeLeft !== 0)}
            className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </form>
      )}
    </section>
  );
}

export default QuizAttemptPage;
