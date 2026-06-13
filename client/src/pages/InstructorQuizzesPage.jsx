import { useState } from "react";
import { useLocation } from "react-router-dom";

import AIQuizGenerator from "../components/instructorQuizzes/AIQuizGenerator";
import QuizAnalyticsPanel from "../components/instructorQuizzes/QuizAnalyticsPanel";
import QuizListSection from "../components/instructorQuizzes/QuizListSection";
import QuizPageHeader from "../components/instructorQuizzes/QuizPageHeader";
import QuizPlacementSelector from "../components/instructorQuizzes/QuizPlacementSelector";
import QuizQuestionsEditor from "../components/instructorQuizzes/QuizQuestionEditor";
import QuizRulesForm from "../components/instructorQuizzes/QuizRulesForm";
import useInstructorQuizzes from "../hooks/useInstructorQuizzes";

function InstructorQuizzesPage() {
  const location = useLocation();
  const [showQuizForm, setShowQuizForm] = useState(false);

  const {
    courses,
    quizzes,
    formData,
    editingQuizId,
    error,
    success,
    isLoading,
    isSaving,
    isGeneratingAI,
    analytics,
    isLoadingAnalytics,
    aiForm,
    setAiForm,
    setAnalytics,
    resetForm,
    handleFormChange,
    handleCourseChange,
    handleSectionChange,
    handleLessonChange,
    handleQuestionChange,
    handleOptionChange,
    addQuestion,
    removeQuestion,
    handleGenerateAIQuiz,
    handleSubmit,
    handleEditQuiz,
    handleDeleteQuiz,
    handleViewAnalytics,
  } = useInstructorQuizzes(location.state?.courseId || "");

  const handleCreateClick = () => {
    resetForm();
    setShowQuizForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    resetForm();
    setShowQuizForm(false);
  };

  const handleEditAndShowForm = (quiz) => {
    handleEditQuiz(quiz);
    setShowQuizForm(true);
  };

  const handleSubmitAndHideForm = async (event) => {
    await handleSubmit(event);
    setShowQuizForm(false);
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-52 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-6 h-32 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <QuizPageHeader onCreateClick={handleCreateClick} />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      {showQuizForm ? (
        <form
          id="create-quiz"
          onSubmit={handleSubmitAndHideForm}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                {editingQuizId ? "Edit Quiz" : "Create Quiz"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Start with basic quiz details, then add questions below.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancelForm}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Quiz Title
              </label>

              <input
                type="text"
                value={formData.title}
                onChange={(event) =>
                  handleFormChange("title", event.target.value)
                }
                placeholder="Example: JavaScript Basics Quiz"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Status
              </label>

              <select
                value={formData.status}
                onChange={(event) =>
                  handleFormChange("status", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Quiz Description
            </label>

            <textarea
              value={formData.description}
              onChange={(event) =>
                handleFormChange("description", event.target.value)
              }
              placeholder="Tell students what this quiz will test."
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
            />
          </div>

          <div className="mt-6">
            <AIQuizGenerator
              aiForm={aiForm}
              setAiForm={setAiForm}
              isGeneratingAI={isGeneratingAI}
              onGenerate={handleGenerateAIQuiz}
            />
          </div>

          <div className="mt-6">
            <QuizPlacementSelector
              courses={courses}
              selectedCourseId={formData.courseId}
              selectedSectionId={formData.sectionId}
              selectedLessonId={formData.lessonId}
              onCourseChange={handleCourseChange}
              onSectionChange={handleSectionChange}
              onLessonChange={handleLessonChange}
            />
          </div>

          <div className="mt-6">
            <QuizRulesForm formData={formData} onChange={handleFormChange} />
          </div>

          <div className="mt-6">
            <QuizQuestionsEditor
              questions={formData.questions}
              onAddQuestion={addQuestion}
              onRemoveQuestion={removeQuestion}
              onQuestionChange={handleQuestionChange}
              onOptionChange={handleOptionChange}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isSaving
              ? "Saving Quiz..."
              : editingQuizId
                ? "Update Quiz"
                : "Create Quiz"}
          </button>
        </form>
      ) : null}

      <QuizAnalyticsPanel
        analytics={analytics}
        isLoading={isLoadingAnalytics}
        onClose={() => setAnalytics(null)}
      />

      <QuizListSection
        quizzes={quizzes}
        onEdit={handleEditAndShowForm}
        onViewAnalytics={handleViewAnalytics}
        onDelete={handleDeleteQuiz}
      />
    </section>
  );
}

export default InstructorQuizzesPage;
