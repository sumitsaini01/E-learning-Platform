import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-7 w-60 rounded bg-zinc-200" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="h-44 rounded-xl bg-zinc-200" />
            <div className="h-44 rounded-xl bg-zinc-200" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Achievements
        </p>

        <h1 className="mt-2 text-3xl font-bold text-zinc-950">
          My Certificates
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          View and verify certificates earned from completed courses.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">
            No certificates yet
          </h2>

          <p className="mt-2 text-sm text-zinc-600">
            Complete all lessons and required quizzes to generate your first
            certificate.
          </p>

          <Link
            to="/courses"
            className="mt-5 inline-flex rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
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
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Certificate of Completion
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-zinc-950">
                      {certificate.courseTitle}
                    </h2>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">
                    {certificate.status}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-zinc-600">
                  <p>
                    <span className="font-semibold text-zinc-800">
                      Student:
                    </span>{" "}
                    {certificate.studentName}
                  </p>

                  <p>
                    <span className="font-semibold text-zinc-800">
                      Instructor:
                    </span>{" "}
                    {certificate.instructorName || "SkillSphere Instructor"}
                  </p>

                  <p>
                    <span className="font-semibold text-zinc-800">
                      Issued:
                    </span>{" "}
                    {issuedDate}
                  </p>

                  <p className="break-all">
                    <span className="font-semibold text-zinc-800">
                      Certificate ID:
                    </span>{" "}
                    {certificate.certificateId}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/certificates/verify/${certificate.certificateId}`}
                    className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    View Certificate
                  </Link>

                  <Link
                    to={`/courses/${certificate.course?._id || certificate.course}`}
                    className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
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

export default MyCertificatesPage;