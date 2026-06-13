import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import { getMyCertificates } from "../services/certificateService";

function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadCertificates = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getMyCertificates();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your certificates.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl">
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-7 w-60 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
            <Award size={28} />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Achievements
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
              My Certificates
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              View and verify certificates earned from completed courses.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {certificates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            No certificates yet
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Complete all lessons and required quizzes to generate your first
            certificate.
          </p>

          <Link
            to="/courses"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {certificates.map((certificate) => {
            const issuedDate = new Date(
              certificate.issuedAt,
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });

            return (
              <div
                key={certificate._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Certificate of Completion
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                      {certificate.courseTitle}
                    </h2>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {certificate.status}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <Info label="Student" value={certificate.studentName} />

                  <Info
                    label="Instructor"
                    value={
                      certificate.instructorName || "SkillSphere Instructor"
                    }
                  />

                  <Info label="Issued" value={issuedDate} />

                  <Info
                    label="Completion"
                    value={`${certificate.completionPercentage || 100}%`}
                  />

                  <p className="break-all">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Certificate ID:
                    </span>{" "}
                    {certificate.certificateId}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/certificates/verify/${certificate.certificateId}`}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Certificate
                  </Link>

                  <Link
                    to={`/courses/${certificate.course?._id || certificate.course}`}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <p>
      <span className="font-semibold text-slate-800 dark:text-slate-200">
        {label}:
      </span>{" "}
      {value}
    </p>
  );
}

export default MyCertificatesPage;
