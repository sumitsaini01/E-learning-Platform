import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRoleRedirectPath } from "../utils/getRoleRedirectPath";
import { uploadThumbnail } from "../services/uploadService";
import api from "../services/api";
import { changePassword } from "../services/authService";

function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      setError("");
      setIsUploading(true);

      const data = await uploadThumbnail(file);

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

      const data = await api.put("/auth/profile", {
        name,
        avatar,
      });

      updateUser(data.data.user);

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
    <section className="mx-auto w-full max-w-3xl">
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
