import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resendEmailOtp, verifyEmailOtp } from "../services/authService";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!email.trim() || !otp.trim()) {
      setError("Email and OTP are required.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsVerifying(true);

      const data = await verifyEmailOtp({
        email: email.trim(),
        otp: otp.trim(),
      });

      navigate("/login", {
        replace: true,
        state: {
          message: data.message || "Email verified successfully. Please login.",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsResending(true);

      const data = await resendEmailOtp(email.trim());

      setMessage(data.message || "OTP resent successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Email Verification
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Verify your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Enter the 6-digit OTP sent to your registered email address.
        </p>

        {message ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleVerify} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">
              OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-center text-lg tracking-[0.35em] outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="mt-4 w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResending ? "Resending..." : "Resend OTP"}
        </button>

        <p className="mt-5 text-center text-sm text-zinc-600">
          Already verified?{" "}
          <Link to="/login" className="font-semibold text-emerald-700">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default VerifyEmailPage;
