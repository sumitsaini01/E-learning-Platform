import DashboardSection from "./DashboardSection";

function CertificatesReady({
  completedCoursesWithoutCertificate = [],
  getCourseId,
  generatingCourseId,
  handleGenerateCertificate,
}) {
  if (completedCoursesWithoutCertificate.length === 0) {
    return null;
  }

  return (
    <DashboardSection title="Certificates Ready">
      <div className="space-y-3">
        {completedCoursesWithoutCertificate.map((course) => {
          const courseId = getCourseId(course);

          return (
            <div
              key={courseId}
              className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">
                  {course.title}
                </p>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  You completed this course. Generate your certificate.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateCertificate(courseId)}
                disabled={generatingCourseId === courseId}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-400"
              >
                {generatingCourseId === courseId
                  ? "Generating..."
                  : "Generate Certificate"}
              </button>
            </div>
          );
        })}
      </div>
    </DashboardSection>
  );
}

export default CertificatesReady;
