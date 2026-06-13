import { Link } from "react-router-dom";

import QuizAttemptCard from "../quizzes/QuizAttemptCard";
import DashboardSection from "./DashboardSection";

function RecentQuizAttempts({ recentQuizAttempts = [] }) {
  return (
    <DashboardSection
      title="Recent Quiz Attempts"
      description="Your latest quiz performance."
      action={
        <Link
          to="/quizzes"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View All
        </Link>
      }
    >
      <div className="space-y-4">
        {recentQuizAttempts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No quiz attempts yet.
          </p>
        ) : (
          recentQuizAttempts.map((attempt) => (
            <QuizAttemptCard
              key={attempt._id}
              attempt={attempt}
              showButton={false}
            />
          ))
        )}
      </div>
    </DashboardSection>
  );
}

export default RecentQuizAttempts;
