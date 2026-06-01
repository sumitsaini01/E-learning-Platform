import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRoleRedirectPath } from "../utils/getRoleRedirectPath";
import { uploadAvatar } from "../services/uploadService";
import {
  changePassword,
  getLearningActivity,
  updateProfile,
} from "../services/authService";

const getDateKey = (date) => new Date(date).toISOString().split("T")[0];

const getActivityLevelClass = (count) => {
  if (!count) return "bg-zinc-100";
  if (count === 1) return "bg-emerald-200";
  if (count <= 3) return "bg-emerald-400";
  if (count <= 5) return "bg-emerald-600";
  return "bg-emerald-800";
};

function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [learningActivity, setLearningActivity] = useState([]);
  const [learningStreak, setLearningStreak] = useState(
    user?.learningStreak || {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
    },
  );

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const loadLearningActivity = async () => {
      try {
        const data = await getLearningActivity();

        setLearningActivity(data.activity || []);
        setLearningStreak(
          data.learningStreak || {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
          },
        );
      } catch {
        setLearningActivity([]);
      }
    };

    if (user?.role === "student") {
      loadLearningActivity();
    }
  }, [user?.role]);

  const heatmapMonths = useMemo(() => {
    const activityMap = new Map(
      learningActivity.map((item) => [getDateKey(item.date), item.count]),
    );

    const year = new Date().getFullYear();

    return Array.from({ length: 12 }).map((_, monthIndex) => {
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);
      const days = [];

      for (let index = 0; index < firstDay.getDay(); index += 1) {
        days.push(null);
      }

      for (let day = 1; day <= lastDay.getDate(); day += 1) {
        const date = new Date(year, monthIndex, day);
        const key = getDateKey(date);

        days.push({
          date,
          key,
          count: activityMap.get(key) || 0,
        });
      }

      return {
        month: firstDay.toLocaleString("default", { month: "short" }),
        days,
      };
    });
  }, [learningActivity]);

  const totalActiveDays = useMemo(() => {
    return heatmapMonths
      .flatMap((month) => month.days)
      .filter((day) => day && day.count > 0).length;
  }, [heatmapMonths]);

  const totalActivities = useMemo(() => {
    return heatmapMonths
      .flatMap((month) => month.days)
      .reduce((total, day) => total + (day?.count || 0), 0);
  }, [heatmapMonths]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      setError("");
      setSuccess("");
      setIsUploading(true);

      const data = await uploadAvatar(file);

      setAvatar(data.url);
      setSuccess("Avatar uploaded. Click Save Profile to update your account.");
    } catch (err) {
      setError(err.response?.data?.message || "Avatar upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsSaving(true);

      const data = await updateProfile({
        name,
        avatar,
      });

      updateUser(data.user);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Current password and new password are required.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsChangingPassword(true);

      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-xl font-bold text-emerald-800">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.name || "User avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials || "U"
              )}
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                Profile
              </p>

              <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
                {user?.name}
              </h1>

              <p className="mt-2 text-sm text-zinc-600">{user?.email}</p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium capitalize text-emerald-800">
            {user?.role}
          </span>
        </div>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSaveProfile} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Profile Avatar
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />

            {isUploading ? (
              <p className="mt-2 text-sm text-emerald-700">
                Uploading avatar...
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-zinc-200 bg-stone-50 p-4">
              <p className="text-sm text-zinc-500">User ID</p>
              <p className="mt-1 break-all text-sm font-medium text-zinc-900">
                {user?.id || user?._id}
              </p>
            </div>

            <div className="rounded-md border border-zinc-200 bg-stone-50 p-4">
              <p className="text-sm text-zinc-500">Account Type</p>
              <p className="mt-1 text-sm font-medium capitalize text-zinc-900">
                {user?.role}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>

            <Link
              to={getRoleRedirectPath(user?.role)}
              className="inline-flex rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              Go to dashboard
            </Link>
          </div>
        </form>

        {user?.role === "student" ? (
          <div className="mt-8 border-t border-zinc-200 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-950">
                  Learning Activity
                </h2>

                <p className="mt-1 text-sm text-zinc-600">
                  Your study consistency this year.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-orange-50 px-3 py-2">
                  <p className="text-lg font-bold text-orange-900">
                    🔥 {learningStreak?.currentStreak || 0}
                  </p>
                  <p className="text-xs text-orange-700">Current</p>
                </div>

                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-lg font-bold text-emerald-900">
                    {learningStreak?.longestStreak || 0}
                  </p>
                  <p className="text-xs text-emerald-700">Longest</p>
                </div>

                <div className="rounded-lg bg-zinc-100 px-3 py-2">
                  <p className="text-lg font-bold text-zinc-950">
                    {totalActivities}
                  </p>
                  <p className="text-xs text-zinc-600">Activities</p>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4">
              <div className="min-w-[900px]">
                <div className="flex gap-4">
                  {heatmapMonths.map((month) => (
                    <div key={month.month}>
                      <div className="mb-2 text-center text-xs text-zinc-500">
                        {month.month}
                      </div>

                      <div className="grid grid-flow-col grid-rows-7 gap-1">
                        {month.days.map((day, index) =>
                          day ? (
                            <div
                              key={day.key}
                              title={`${day.key}: ${day.count} learning activities`}
                              className={`h-3 w-3 rounded-sm ${getActivityLevelClass(
                                day.count,
                              )}`}
                            />
                          ) : (
                            <div key={index} className="h-3 w-3" />
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>{totalActiveDays} active days this year</span>

                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <span className="h-3 w-3 rounded-sm bg-zinc-100" />
                  <span className="h-3 w-3 rounded-sm bg-emerald-200" />
                  <span className="h-3 w-3 rounded-sm bg-emerald-400" />
                  <span className="h-3 w-3 rounded-sm bg-emerald-600" />
                  <span className="h-3 w-3 rounded-sm bg-emerald-800" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 border-t border-zinc-200 pt-8">
          <h2 className="text-xl font-semibold text-zinc-950">
            Change Password
          </h2>

          <p className="mt-1 text-sm text-zinc-600">
            Update your password while you are logged in.
          </p>

          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-800">
                Current Password
              </label>

              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  New Password
                </label>

                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
