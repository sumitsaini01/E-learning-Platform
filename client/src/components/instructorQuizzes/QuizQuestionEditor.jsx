function QuizQuestionsEditor({
  questions = [],
  onAddQuestion,
  onRemoveQuestion,
  onQuestionChange,
  onOptionChange,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-950 dark:text-white">Questions</h3>

        <button
          type="button"
          onClick={onAddQuestion}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Add Question
        </button>
      </div>

      {questions.map((question, questionIndex) => (
        <div
          key={questionIndex}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="font-bold text-slate-950 dark:text-white">
              Question {questionIndex + 1}
            </p>

            <button
              type="button"
              onClick={() => onRemoveQuestion(questionIndex)}
              className="text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
            >
              Remove
            </button>
          </div>

          <textarea
            value={question.questionText}
            onChange={(event) =>
              onQuestionChange(
                questionIndex,
                "questionText",
                event.target.value,
              )
            }
            placeholder="Question text"
            className="mt-4 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
            required
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    type="radio"
                    name={`correct-${questionIndex}`}
                    checked={
                      Number(question.correctOptionIndex) === optionIndex
                    }
                    onChange={() =>
                      onQuestionChange(
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
                    onOptionChange(
                      questionIndex,
                      optionIndex,
                      event.target.value,
                    )
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
            <input
              type="text"
              value={question.explanation}
              onChange={(event) =>
                onQuestionChange(
                  questionIndex,
                  "explanation",
                  event.target.value,
                )
              }
              placeholder="Explanation after submission"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
            />

            <input
              type="number"
              min="1"
              value={question.points}
              onChange={(event) =>
                onQuestionChange(questionIndex, "points", event.target.value)
              }
              placeholder="Points"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuizQuestionsEditor;
