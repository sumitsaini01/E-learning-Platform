import InstructorCourseCard from "./InstructorCourseCard";

function InstructorCourseSections({
  publishedCourses = [],
  draftCourses = [],
  actionLoadingId = "",
  onPublish,
  onUnpublish,
  onDelete,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CourseSection
        title="Published Courses"
        description="Courses currently visible to students."
        emptyMessage="No published courses yet."
        courses={publishedCourses}
        actionLoadingId={actionLoadingId}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />

      <CourseSection
        title="Draft Courses"
        description="Courses still in progress or hidden from students."
        emptyMessage="No draft courses available."
        courses={draftCourses}
        actionLoadingId={actionLoadingId}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />
    </div>
  );
}

function CourseSection({
  title,
  description,
  emptyMessage,
  courses,
  actionLoadingId,
  onPublish,
  onUnpublish,
  onDelete,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {courses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {emptyMessage}
          </p>
        ) : (
          courses.map((course) => (
            <InstructorCourseCard
              key={course._id || course.id}
              course={course}
              actionLoadingId={actionLoadingId}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default InstructorCourseSections;
