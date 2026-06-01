import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyCertificate } from "../services/certificateService";

const printStyles = `
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }

  html,
  body,
  #root {
    width: 297mm;
    height: 210mm;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background: white !important;
  }

  nav,
  header,
  footer,
  .print-hidden {
    display: none !important;
  }

  section {
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
    width: 297mm !important;
    height: 210mm !important;
  }

  #certificate-print {
    width: 297mm !important;
    height: 210mm !important;
    min-height: 210mm !important;
    max-height: 210mm !important;
    overflow: hidden !important;
    page-break-inside: avoid;
    break-inside: avoid;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
}
`;

function CertificateVerificationPage() {
  const { certificateId } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let shouldUpdate = true;

    const loadCertificate = async () => {
      try {
        setError("");

        const data = await verifyCertificate(certificateId);

        if (!shouldUpdate) return;

        setCertificate(data.certificate);
      } catch (err) {
        if (!shouldUpdate) return;

        setError(
          err.response?.data?.message || "Unable to verify certificate.",
        );
      } finally {
        if (shouldUpdate) {
          setIsLoading(false);
        }
      }
    };

    loadCertificate();

    return () => {
      shouldUpdate = false;
    };
  }, [certificateId]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl">
        <div className="animate-pulse rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
          <div className="h-8 w-64 rounded bg-zinc-200" />
          <div className="mt-8 h-96 rounded bg-zinc-200" />
        </div>
      </section>
    );
  }

  if (error || !certificate) {
    return (
      <section className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
            Certificate Verification Failed
          </p>

          <h1 className="mt-3 text-3xl font-bold text-zinc-950">
            Invalid Certificate
          </h1>

          <p className="mt-4 text-sm leading-6 text-zinc-700">
            {error || "This certificate could not be verified."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-md bg-zinc-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <section className="mx-auto max-w-6xl">
      <style>{printStyles}</style>

      <div className="print-hidden mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Verified Certificate
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-950">
            SkillSphere Certificate
          </h1>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Download / Print
        </button>
      </div>

      <div
        id="certificate-print"
        className="relative mx-auto aspect-[1.414/1] w-full max-w-[1120px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        <div className="absolute left-0 top-0 h-56 w-56 rounded-br-full bg-emerald-950" />
        <div className="absolute left-0 top-0 h-44 w-44 rounded-br-full bg-emerald-700" />
        <div className="absolute left-0 top-0 h-32 w-32 rounded-br-full bg-amber-400" />

        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-tl-full bg-emerald-950" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-tl-full bg-emerald-700" />
        <div className="absolute bottom-0 right-0 h-32 w-32 rounded-tl-full bg-amber-400" />

        <div className="absolute inset-8 border-4 border-amber-400" />
        <div className="absolute inset-11 border border-emerald-900/30" />

        <div className="absolute left-14 top-14 text-5xl text-amber-400">❦</div>
        <div className="absolute right-14 top-14 text-5xl text-amber-400">
          ❦
        </div>
        <div className="absolute bottom-14 left-14 text-5xl text-amber-400">
          ❦
        </div>
        <div className="absolute bottom-14 right-14 text-5xl text-amber-400">
          ❦
        </div>

        <div className="relative z-10 flex h-full flex-col px-24 py-16 text-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.5em] text-emerald-800">
              SkillSphere
            </p>

            <h2 className="mt-6 text-6xl font-black uppercase tracking-tight text-emerald-950">
              Certificate
            </h2>

            <p className="-mt-1 text-4xl font-semibold text-amber-500">
              of Completion
            </p>
          </div>

          <div className="mt-8 flex-1">
            <p className="text-sm font-medium text-zinc-700">
              This certificate is proudly presented to
            </p>

            <h3 className="mt-4 font-serif text-6xl italic text-amber-500">
              {certificate.studentName}
            </h3>

            <p className="mx-auto mt-6 max-w-2xl text-sm font-medium leading-6 text-zinc-700">
              for successfully completing the course and demonstrating
              dedication, consistency, and strong learning commitment.
            </p>

            <h4 className="mx-auto mt-5 max-w-3xl text-3xl font-black text-emerald-950">
              {certificate.courseTitle}
            </h4>
          </div>

          <div className="grid grid-cols-3 items-end gap-10 text-left">
            <div>
              <div className="h-px w-44 bg-emerald-950" />
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-emerald-950">
                Authorized By
              </p>
              <p className="text-sm font-bold text-emerald-800">
                {certificate.instructorName || "SkillSphere Instructor"}
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-8 border-amber-300 bg-gradient-to-br from-amber-200 to-amber-500 shadow-lg">
                <span className="text-3xl">✓</span>
              </div>

              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-zinc-600">
                Verified Certificate
              </p>

              <p className="mt-1 break-all text-[11px] font-semibold text-zinc-500">
                {certificate.certificateId}
              </p>
            </div>

            <div className="text-right">
              <div className="ml-auto h-px w-44 bg-emerald-950" />
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-emerald-950">
                Date
              </p>
              <p className="text-sm font-bold text-emerald-800">{issuedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CertificateVerificationPage;
