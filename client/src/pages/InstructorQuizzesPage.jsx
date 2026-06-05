import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getInstructorCourses } from "../services/courseService";
import {
  createQuiz,
  deleteQuiz,
  generateAIQuiz,
  getInstructorQuizzes,
  getQuizAnalytics,
  updateQuiz,
} from "../services/quizService";

const emptyQuestion = {
  questionText: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  explanation: "",
  points: 1,
};

const initialQuizForm = {
  title: "",
  description: "",
  courseId: "",
  placementType: "course",
  sectionId: "",
  lessonId: "",
  passingPercentage: 60,
  timeLimitMinutes: 0,
  maxAttempts: 0,
  status: "draft",
  source: "manual",
  aiPrompt: "",
  questions: [{ ...emptyQuestion }],
};

function InstructorQuizzesPage() {
  const location = useLocation();

  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [formData, setFormData] = useState({
    ...initialQuizForm,
    courseId: location.state?.courseId || "",
  });

  const [editingQuizId, setEditingQuizId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [aiForm, setAiForm] = useState({
    topic: "",
    difficulty: "intermediate",
    questionCount: 5,
  });

  const selectedCourse = useMemo(() => {
    return courses.find((course) => {
      const courseId = course._id || course.id;
      return courseId === formData.courseId;
    });
  }, [courses, formData.courseId]);

  const selectedSection = useMemo(() => {
    return selectedCourse?.sections?.find(
      (section) => section._id === formData.sectionId,
    );
  }, [selectedCourse, formData.sectionId]);

  const loadPageData = async () => {
    try {
      setError("");

      const [coursesData, quizzesData] = await Promise.all([
        getInstructorCourses(),
        getInstructorQuizzes(),
      ]);

      setCourses(coursesData.courses || []);
      setQuizzes(quizzesData.quizzes || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load quiz management data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const resetForm = () => {
    setEditingQuizId("");
    setFormData({
      ...initialQuizForm,
      courseId: location.state?.courseId || "",
      questions: [{ ...emptyQuestion }],
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      if (field === "courseId") {
        next.sectionId = "";
        next.lessonId = "";
        next.placementType = "course";
      }

      if (field === "placementType") {
        next.sectionId = "";
        next.lessonId = "";
      }

      if (field === "sectionId") {
        next.lessonId = "";
      }

      return next;
    });
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setFormData((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              [field]: value,
            }
          : question,
      ),
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;

        const nextOptions = [...question.options];
        nextOptions[optionIndex] = value;

        return {
          ...question,
          options: nextOptions,
        };
      }),
    }));
  };

  const addQuestion = () => {
    setFormData((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          ...emptyQuestion,
          options: ["", "", "", ""],
        },
      ],
    }));
  };

  const removeQuestion = (questionIndex) => {
    setFormData((current) => ({
      ...current,
      questions:
        current.questions.length === 1
          ? current.questions
          : current.questions.filter((_, index) => index !== questionIndex),
    }));
  };

  const cleanPayload = () => {
    const sectionId =
      formData.placementType === "section" ||
      formData.placementType === "lesson"
        ? formData.sectionId
        : "";

    const lessonId =
      formData.placementType === "lesson" ? formData.lessonId : "";

    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      courseId: formData.courseId,
      sectionId,
      lessonId,
      passingPercentage: Number(formData.passingPercentage) || 60,
      timeLimitMinutes: Number(formData.timeLimitMinutes) || 0,
      maxAttempts: Number(formData.maxAttempts) || 0,
      status: formData.status,
      source: formData.source || "manual",
      aiPrompt: formData.aiPrompt || "",
      questions: formData.questions.map((question) => ({
        questionText: question.questionText.trim(),
        options: question.options.map((option) => option.trim()),
        correctOptionIndex: Number(question.correctOptionIndex),
        explanation: question.explanation?.trim() || "",
        points: Number(question.points) || 1,
      })),
    };
  };

  const validateQuiz = () => {
    if (!formData.title.trim()) return "Quiz title is required.";
    if (!formData.courseId) return "Please select a course.";

    if (formData.placementType === "section" && !formData.sectionId) {
      return "Please select a section.";
    }

    if (formData.placementType === "lesson" && !formData.lessonId) {
      return "Please select a lesson.";
    }

    if (formData.questions.length === 0) {
      return "At least one question is required.";
    }

    for (const question of formData.questions) {
      if (!question.questionText.trim()) {
        return "Every question needs question text.";
      }

      const validOptions = question.options.filter((option) => option.trim());

      if (validOptions.length < 2) {
        return "Every question needs at least two options.";
      }

      if (!question.options[question.correctOptionIndex]?.trim()) {
        return "Correct option cannot be empty.";
      }
    }

    return "";
  };

  const handleGenerateAIQuiz = async () => {
    if (!formData.courseId) {
      setError("Please select a course before generating AI questions.");
      return;
    }

    if (!aiForm.topic.trim()) {
      setError("Please enter a topic for AI quiz generation.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsGeneratingAI(true);

      const data = await generateAIQuiz({
        courseId: formData.courseId,
        topic: aiForm.topic.trim(),
        difficulty: aiForm.difficulty,
        questionCount: Number(aiForm.questionCount) || 5,
      });

      if (!data.questions?.length) {
        setError("AI did not generate any valid questions. Try another topic.");
        return;
      }

      setFormData((current) => ({
        ...current,
        title: current.title || `${aiForm.topic.trim()} Quiz`,
        description:
          current.description ||
          `AI-generated ${aiForm.difficulty} level quiz on ${aiForm.topic.trim()}.`,
        source: "ai",
        aiPrompt: aiForm.topic.trim(),
        questions: data.questions,
      }));

      setSuccess(
        "AI questions generated successfully. Review them before saving.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to generate AI quiz questions.",
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateQuiz();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsSaving(true);

      const payload = cleanPayload();

      if (editingQuizId) {
        await updateQuiz(editingQuizId, payload);
        setSuccess("Quiz updated successfully.");
      } else {
        await createQuiz(payload);
        setSuccess("Quiz created successfully.");
      }

      resetForm();
      await loadPageData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save quiz.");
    } finally {
      setIsSaving(false);
    }
  };

  const getPlacementType = (quiz) => {
    if (quiz.lessonId) return "lesson";
    if (quiz.sectionId) return "section";
    return "course";
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuizId(quiz._id);

    setFormData({
      title: quiz.title || "",
      description: quiz.description || "",
      courseId: quiz.course?._id || quiz.course || "",
      placementType: getPlacementType(quiz),
      sectionId: quiz.sectionId || "",
      lessonId: quiz.lessonId || "",
      passingPercentage: quiz.passingPercentage || 60,
      timeLimitMinutes: quiz.timeLimitMinutes || 0,
      maxAttempts: quiz.maxAttempts || 0,
      status: quiz.status || "draft",
      questions:
        quiz.questions?.length > 0
          ? quiz.questions.map((question) => ({
              questionText: question.questionText || "",
              options:
                question.options?.length > 0
                  ? question.options
                  : ["", "", "", ""],
              correctOptionIndex: question.correctOptionIndex || 0,
              explanation: question.explanation || "",
              points: question.points || 1,
            }))
          : [{ ...emptyQuestion }],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz and all attempts?")) return;

    try {
      setError("");
      setSuccess("");

      await deleteQuiz(quizId);

      setSuccess("Quiz deleted successfully.");
      await loadPageData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete quiz.");
    }
  };

  const handleToggleStatus = async (quiz) => {
    try {
      setError("");
      setSuccess("");

      const nextStatus = quiz.status === "published" ? "draft" : "published";

      await updateQuiz(quiz._id, {
        status: nextStatus,
      });

      setSuccess(
        nextStatus === "published"
          ? "Quiz published successfully."
          : "Quiz moved to draft.",
      );

      await loadPageData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update quiz status.");
    }
  };

  const handleViewAnalytics = async (quizId) => {
    try {
      setError("");
      setSuccess("");
      setIsLoadingAnalytics(true);

      const data = await getQuizAnalytics(quizId);

      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load quiz analytics.");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-52 rounded bg-zinc-200" />
          <div className="mt-6 h-32 rounded bg-zinc-200" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Instructor
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Quiz Management
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Create quizzes for a full course, a specific section, or one
              lesson.
            </p>
          </div>

          <Link
            to="/dashboard/instructor"
            className="inline-flex justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">
              {editingQuizId ? "Edit Quiz" : "Create Quiz"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Start with basic quiz details, then add questions below.
            </p>
          </div>

          {editingQuizId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Quiz Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) =>
                handleFormChange("title", event.target.value)
              }
              placeholder="Example: JavaScript Basics Quiz"
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Select Course
            </label>
            <select
              value={formData.courseId}
              onChange={(event) =>
                handleFormChange("courseId", event.target.value)
              }
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              required
            >
              <option value="">Choose a course</option>
              {courses.map((course) => {
                const courseId = course._id || course.id;

                return (
                  <option key={courseId} value={courseId}>
                    {course.title}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-zinc-800">
            Quiz Description
          </label>
          <textarea
            value={formData.description}
            onChange={(event) =>
              handleFormChange("description", event.target.value)
            }
            placeholder="Tell students what this quiz will test."
            className="mt-2 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/40 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-zinc-950">AI Quiz Generator</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Generate quiz questions using AI, then review and edit before
                saving.
              </p>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              New
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px_160px]">
            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Topic / Prompt
              </label>
              <input
                type="text"
                value={aiForm.topic}
                onChange={(event) =>
                  setAiForm((current) => ({
                    ...current,
                    topic: event.target.value,
                  }))
                }
                placeholder="Example: React Hooks, MongoDB Aggregation, DSA Arrays"
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Difficulty
              </label>
              <select
                value={aiForm.difficulty}
                onChange={(event) =>
                  setAiForm((current) => ({
                    ...current,
                    difficulty: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Questions
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={aiForm.questionCount}
                onChange={(event) =>
                  setAiForm((current) => ({
                    ...current,
                    questionCount: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAIQuiz}
            disabled={isGeneratingAI}
            className="mt-4 rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isGeneratingAI ? "Generating..." : "Generate Questions with AI"}
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-stone-50 p-5">
          <h3 className="font-semibold text-zinc-950">Quiz Placement</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Choose where this quiz belongs. Course quiz is usually used as a
            final quiz.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["course", "Whole Course", "Final or general course quiz"],
              ["section", "Specific Section", "Quiz after a section/module"],
              ["lesson", "Specific Lesson", "Quiz after one lesson"],
            ].map(([value, title, description]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-lg border p-4 transition ${
                  formData.placementType === value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-zinc-200 bg-white hover:border-emerald-200"
                }`}
              >
                <input
                  type="radio"
                  name="placementType"
                  value={value}
                  checked={formData.placementType === value}
                  onChange={(event) =>
                    handleFormChange("placementType", event.target.value)
                  }
                  className="sr-only"
                />
                <p className="font-semibold text-zinc-950">{title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  {description}
                </p>
              </label>
            ))}
          </div>

          {formData.placementType !== "course" ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  Select Section
                </label>
                <select
                  value={formData.sectionId}
                  onChange={(event) =>
                    handleFormChange("sectionId", event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Choose section</option>
                  {selectedCourse?.sections?.map((section) => (
                    <option key={section._id} value={section._id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>

              {formData.placementType === "lesson" ? (
                <div>
                  <label className="block text-sm font-medium text-zinc-800">
                    Select Lesson
                  </label>
                  <select
                    value={formData.lessonId}
                    onChange={(event) =>
                      handleFormChange("lessonId", event.target.value)
                    }
                    className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-zinc-100"
                    disabled={!formData.sectionId}
                  >
                    <option value="">
                      {formData.sectionId
                        ? "Choose lesson"
                        : "Select section first"}
                    </option>
                    {selectedSection?.lessons?.map((lesson) => (
                      <option key={lesson._id} value={lesson._id}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
          <h3 className="font-semibold text-zinc-950">Quiz Rules</h3>

          <div className="mt-4 grid gap-5 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Passing Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.passingPercentage}
                onChange={(event) =>
                  handleFormChange("passingPercentage", event.target.value)
                }
                className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Example: 60 means student needs 60%.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Time Limit
              </label>
              <input
                type="number"
                min="0"
                value={formData.timeLimitMinutes}
                onChange={(event) =>
                  handleFormChange("timeLimitMinutes", event.target.value)
                }
                className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Minutes. Use 0 for no limit.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Max Attempts
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxAttempts}
                onChange={(event) =>
                  handleFormChange("maxAttempts", event.target.value)
                }
                className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Use 0 for unlimited attempts.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(event) =>
                  handleFormChange("status", event.target.value)
                }
                className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <p className="mt-1 text-xs text-zinc-500">
                Draft is hidden from students.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-950">Questions</h3>

            <button
              type="button"
              onClick={addQuestion}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              Add Question
            </button>
          </div>

          {formData.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="rounded-lg border border-zinc-200 bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-zinc-950">
                  Question {questionIndex + 1}
                </p>

                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <textarea
                value={question.questionText}
                onChange={(event) =>
                  handleQuestionChange(
                    questionIndex,
                    "questionText",
                    event.target.value,
                  )
                }
                placeholder="Question text"
                className="mt-4 min-h-20 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                required
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="rounded-md border border-zinc-200 bg-white p-3"
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-600">
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={
                          Number(question.correctOptionIndex) === optionIndex
                        }
                        onChange={() =>
                          handleQuestionChange(
                            questionIndex,
                            "correctOptionIndex",
                            optionIndex,
                          )
                        }
                      />
                      Correct option {optionIndex + 1}
                    </div>

                    <input
                      type="text"
                      value={option}
                      onChange={(event) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          event.target.value,
                        )
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
                <input
                  type="text"
                  value={question.explanation}
                  onChange={(event) =>
                    handleQuestionChange(
                      questionIndex,
                      "explanation",
                      event.target.value,
                    )
                  }
                  placeholder="Explanation after submission"
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />

                <input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(event) =>
                    handleQuestionChange(
                      questionIndex,
                      "points",
                      event.target.value,
                    )
                  }
                  placeholder="Points"
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {isSaving
            ? "Saving Quiz..."
            : editingQuizId
              ? "Update Quiz"
              : "Create Quiz"}
        </button>
      </form>

      {analytics ? (
        <div className="rounded-lg border border-purple-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-purple-700">
                Quiz Analytics
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                {analytics.quizTitle}
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                Course: {analytics.courseTitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAnalytics(null)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              Close
            </button>
          </div>

          {isLoadingAnalytics ? (
            <p className="mt-5 text-sm text-zinc-500">Loading analytics...</p>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-5">
                <AnalyticsCard
                  label="Attempts"
                  value={analytics.totalAttempts}
                />
                <AnalyticsCard label="Passed" value={analytics.passed} />
                <AnalyticsCard label="Failed" value={analytics.failed} />
                <AnalyticsCard
                  label="Average"
                  value={`${analytics.averageScore}%`}
                />
                <AnalyticsCard
                  label="Pass Rate"
                  value={`${analytics.passRate}%`}
                />
              </div>

              {analytics.mostMissedQuestion ? (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-semibold text-zinc-950">
                    Most Missed Question
                  </h3>

                  <p className="mt-2 text-sm text-zinc-700">
                    {analytics.mostMissedQuestion.questionText}
                  </p>

                  <p className="mt-2 text-sm font-medium text-amber-800">
                    Missed {analytics.mostMissedQuestion.missedCount} times
                  </p>
                </div>
              ) : null}

              {analytics.recentAttempts?.length ? (
                <div className="mt-6">
                  <h3 className="font-semibold text-zinc-950">
                    Recent Attempts
                  </h3>

                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-zinc-200 text-zinc-500">
                        <tr>
                          <th className="py-2 pr-4">Student</th>
                          <th className="py-2 pr-4">Score</th>
                          <th className="py-2 pr-4">Result</th>
                          <th className="py-2 pr-4">Submitted</th>
                        </tr>
                      </thead>

                      <tbody>
                        {analytics.recentAttempts.map((attempt) => (
                          <tr
                            key={attempt.attemptId}
                            className="border-b border-zinc-100"
                          >
                            <td className="py-2 pr-4">
                              {attempt.student?.name ||
                                attempt.student?.email ||
                                "Student"}
                            </td>
                            <td className="py-2 pr-4">{attempt.percentage}%</td>
                            <td className="py-2 pr-4">
                              {attempt.passed ? "Passed" : "Failed"}
                            </td>
                            <td className="py-2 pr-4">
                              {attempt.submittedAt
                                ? new Date(attempt.submittedAt).toLocaleString()
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">Your Quizzes</h2>

        <div className="mt-5 space-y-4">
          {quizzes.length === 0 ? (
            <p className="rounded-md bg-stone-50 p-4 text-sm text-zinc-600">
              No quizzes created yet.
            </p>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="rounded-lg border border-zinc-200 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-950">
                        {quiz.title}
                      </h3>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          quiz.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-600">
                      Course: {quiz.course?.title || "Unknown course"}
                    </p>

                    <p className="mt-2 text-sm text-zinc-600">
                      {quiz.questions?.length || 0} questions • Passing{" "}
                      {quiz.passingPercentage}% •{" "}
                      {quiz.maxAttempts > 0
                        ? `${quiz.maxAttempts} attempts`
                        : "Unlimited attempts"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditQuiz(quiz)}
                      className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewAnalytics(quiz._id)}
                      className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      Analytics
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(quiz)}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      {quiz.status === "published" ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function AnalyticsCard({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-stone-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export default InstructorQuizzesPage;
