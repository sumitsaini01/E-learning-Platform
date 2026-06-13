import { useEffect, useState } from "react";
import { Bell, Camera, Lock, Save, Shield, User } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { changePassword, updateProfile } from "../services/authService";
import { uploadThumbnail } from "../services/uploadService";

function InstructorSettingsPage() {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      setError("");
      setSuccess("");
      setIsUploadingAvatar(true);

      const data = await uploadThumbnail(file);

      setProfileForm((current) => ({
        ...current,
        avatar: data.url,
      }));

      setSuccess("Avatar uploaded. Click Save Profile to update it.");
    } catch (err) {
      setError(err.response?.data?.message || "Avatar upload failed.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");
      setIsSavingProfile(true);

      const data = await updateProfile({
        name: profileForm.name,
        avatar: profileForm.avatar,
      });

      setSuccess(data.message || "Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsChangingPassword(true);

      const data = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccess(data.message || "Password changed successfully.");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Settings
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Instructor Settings
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage your profile, avatar, password, and notifications.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      <form
        onSubmit={handleSaveProfile}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-5 flex items-center gap-3">
          <User className="text-blue-600 dark:text-blue-400" size={22} />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Profile Information
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>

            <input
              type="email"
              value={profileForm.email}
              readOnly
              className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            <Save size={18} />
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-3">
          <Camera className="text-blue-600 dark:text-blue-400" size={22} />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Profile Avatar
          </h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {profileForm.avatar ? (
            <img
              src={profileForm.avatar}
              alt={profileForm.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold dark:bg-slate-800 dark:text-white">
              {profileForm.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <label className="inline-flex cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <form
        onSubmit={handleChangePassword}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-5 flex items-center gap-3">
          <Lock className="text-blue-600 dark:text-blue-400" size={22} />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Change Password
          </h2>
        </div>

        <div className="grid gap-5">
          <input
            type="password"
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Current Password"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            placeholder="New Password"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm New Password"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          <Lock size={18} />
          {isChangingPassword ? "Changing..." : "Change Password"}
        </button>
      </form>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-3">
          <Bell className="text-blue-600 dark:text-blue-400" size={22} />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Notification Settings
          </h2>
        </div>

        <div className="space-y-4">
          {[
            "New student enrollment",
            "Quiz submission alerts",
            "Assignment notifications",
          ].map((label) => (
            <label key={label} className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">
                {label}
              </span>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-3">
          <Shield className="text-blue-600 dark:text-blue-400" size={22} />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Account Security
          </h2>
        </div>

        <div className="space-y-3">
          <SecurityItem title="Two-Factor Authentication" />
          <SecurityItem title="Login Activity" />
        </div>
      </div>
    </section>
  );
}

function SecurityItem({ title }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="font-medium text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Coming soon.
      </p>
    </div>
  );
}

export default InstructorSettingsPage;
