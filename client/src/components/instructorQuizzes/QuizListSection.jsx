import InstructorQuizCard from "./InstructorQuizCard";

function QuizListSection({ quizzes = [], onEdit, onViewAnalytics, onDelete }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-950 dark:text-white">
        Your Quizzes
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Manage quiz status, edit questions, view analytics, or delete quizzes.
      </p>

      <div className="mt-6 space-y-4">
        {quizzes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No quizzes created yet.
          </p>
        ) : (
          quizzes.map((quiz) => (
            <InstructorQuizCard
              key={quiz._id}
              quiz={quiz}
              onEdit={onEdit}
              onViewAnalytics={(selectedQuiz) =>
                onViewAnalytics(selectedQuiz._id)
              }
              onDelete={(selectedQuiz) => onDelete(selectedQuiz._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default QuizListSection;
