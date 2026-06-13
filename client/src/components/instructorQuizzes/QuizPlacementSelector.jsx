function QuizPlacementSelector({
  courses = [],
  selectedCourseId,
  selectedSectionId,
  selectedLessonId,
  onCourseChange,
  onSectionChange,
  onLessonChange,
}) {
  const selectedCourse = courses.find(
    (course) => (course._id || course.id) === selectedCourseId,
  );

  const sections = selectedCourse?.sections || [];

  const selectedSection = sections.find(
    (section) => section._id === selectedSectionId,
  );

  const lessons = selectedSection?.lessons || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">
        Quiz Placement
      </h3>

      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Select where this quiz belongs inside the course curriculum.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Course
          </label>

          <select
            value={selectedCourseId}
            onChange={(event) => onCourseChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Select Course</option>

            {courses.map((course) => (
              <option
                key={course._id || course.id}
                value={course._id || course.id}
              >
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Section
          </label>

          <select
            value={selectedSectionId}
            onChange={(event) => onSectionChange(event.target.value)}
            disabled={!selectedCourseId}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Select Section</option>

            {sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Lesson
          </label>

          <select
            value={selectedLessonId}
            onChange={(event) => onLessonChange(event.target.value)}
            disabled={!selectedSectionId}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Select Lesson</option>

            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default QuizPlacementSelector;
