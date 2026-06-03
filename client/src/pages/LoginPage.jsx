import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRoleRedirectPath } from "../utils/getRoleRedirectPath";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, user } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRoleRedirectPath(user?.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(formData);
      navigate(redirectTo || getRoleRedirectPath(user.role), { replace: true });
    } catch (err) {
      if (err.response?.data?.requiresEmailVerification) {
        navigate("/verify-email", {
          state: {
            email: err.response.data.email || formData.email,
            message: err.response.data.message,
          },
        });
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-950">Login</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Access your learning workspace.
          </p>
        </div>

        {location.state?.message ? (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {location.state.message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-800"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-800"
            >
              Password
            </label>

            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-11 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-800"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Forgot Password?
          </Link>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-600">
          New here?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
