function QuizBasicDetails({ formData, courses = [], onChange }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Quiz Title
          </label>

          <input
            type="text"
            value={formData.title}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="Example: JavaScript Basics Quiz"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Select Course
          </label>

          <select
            value={formData.courseId}
            onChange={(event) => onChange("courseId", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
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

      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          Quiz Description
        </label>

        <textarea
          value={formData.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Tell students what this quiz will test."
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
        />
      </div>
    </div>
  );
}

export default QuizBasicDetails;
