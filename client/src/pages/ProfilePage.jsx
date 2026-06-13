import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, User } from "lucide-react";

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
  if (!count) return "bg-slate-100 dark:bg-slate-800";
  if (count === 1) return "bg-blue-200 dark:bg-blue-900";
  if (count <= 3) return "bg-blue-400 dark:bg-blue-700";
  if (count <= 5) return "bg-blue-600 dark:bg-blue-500";
  return "bg-blue-800 dark:bg-blue-300";
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xl font-bold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
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
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Profile
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                {user?.name}
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold capitalize text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
            {user?.role}
          </span>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSaveProfile} className="mt-8 space-y-5">
          <SectionTitle icon={User} title="Profile Information" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Profile Avatar
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            />

            {isUploading ? (
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                Uploading avatar...
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AccountInfo label="User ID" value={user?.id || user?._id} />
            <AccountInfo label="Account Type" value={user?.role} capitalize />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>

            <Link
              to={getRoleRedirectPath(user?.role)}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Go to dashboard
            </Link>
          </div>
        </form>

        {user?.role === "student" ? (
          <LearningActivitySection
            heatmapMonths={heatmapMonths}
            learningStreak={learningStreak}
            totalActivities={totalActivities}
            totalActiveDays={totalActiveDays}
          />
        ) : null}

        <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800">
          <SectionTitle icon={Lock} title="Change Password" />

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Update your password while you are logged in.
          </p>

          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
            <PasswordInput
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(value) =>
                setPasswordForm((current) => ({
                  ...current,
                  currentPassword: value,
                }))
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordInput
                label="New Password"
                value={passwordForm.newPassword}
                onChange={(value) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: value,
                  }))
                }
              />

              <PasswordInput
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(value) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: value,
                  }))
                }
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={20} className="text-blue-600 dark:text-blue-400" />
      <h2 className="text-xl font-bold text-slate-950 dark:text-white">
        {title}
      </h2>
    </div>
  );
}

function AccountInfo({ label, value, capitalize = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-1 break-all text-sm font-semibold text-slate-950 dark:text-white ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PasswordInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
      />
    </div>
  );
}

function LearningActivitySection({
  heatmapMonths,
  learningStreak,
  totalActivities,
  totalActiveDays,
}) {
  return (
    <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Learning Activity
          </h2>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Your study consistency this year.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <ActivityStat
            label="Current"
            value={`🔥 ${learningStreak?.currentStreak || 0}`}
          />
          <ActivityStat
            label="Longest"
            value={learningStreak?.longestStreak || 0}
          />
          <ActivityStat label="Activities" value={totalActivities} />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="min-w-[900px]">
          <div className="flex gap-4">
            {heatmapMonths.map((month) => (
              <div key={month.month}>
                <div className="mb-2 text-center text-xs text-slate-500 dark:text-slate-400">
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

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{totalActiveDays} active days this year</span>

          <div className="flex items-center gap-1">
            <span>Less</span>
            <span className="h-3 w-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
            <span className="h-3 w-3 rounded-sm bg-blue-200 dark:bg-blue-900" />
            <span className="h-3 w-3 rounded-sm bg-blue-400 dark:bg-blue-700" />
            <span className="h-3 w-3 rounded-sm bg-blue-600 dark:bg-blue-500" />
            <span className="h-3 w-3 rounded-sm bg-blue-800 dark:bg-blue-300" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-blue-50 px-3 py-2 dark:bg-blue-950/40">
      <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
        {value}
      </p>
      <p className="text-xs text-blue-700 dark:text-blue-400">{label}</p>
    </div>
  );
}

export default ProfilePage;
