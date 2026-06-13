import { Link } from "react-router-dom";
import DashboardSection from "./DashboardSection";

function DashboardCertificates({ certificates = [] }) {
  return (
    <DashboardSection
      title="My Certificates"
      description="Certificates you have earned from completed courses."
      action={
        certificates.length > 0 ? (
          <Link
            to="/my-certificates"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View All
          </Link>
        ) : null
      }
    >
      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No certificates earned yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.slice(0, 3).map((certificate) => (
            <div
              key={certificate._id}
              className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Certificate
              </p>

              <h3 className="mt-2 line-clamp-2 font-semibold text-slate-950 dark:text-white">
                {certificate.courseTitle}
              </h3>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Issued to {certificate.studentName}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {new Date(
                  certificate.issuedAt || certificate.createdAt,
                ).toLocaleDateString()}
              </p>

              {certificate.certificateId ? (
                <Link
                  to={`/certificates/verify/${certificate.certificateId}`}
                  className="mt-4 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Verify Certificate
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

export default DashboardCertificates;
