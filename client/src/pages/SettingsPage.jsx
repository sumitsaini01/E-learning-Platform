import { Bell, Lock, Moon, Shield, User, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

function SettingsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Settings
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Account Settings
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage your profile, password, appearance, notifications, and account
          preferences.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsCard
          icon={<User size={22} />}
          title="Profile Settings"
          description="Update your name, avatar, and account information."
          status="Available"
          to="/profile"
        />

        <SettingsCard
          icon={<Lock size={22} />}
          title="Password & Security"
          description="Change your password from the profile page."
          status="Available"
          to="/profile"
        />

        <SettingsCard
          icon={<Bell size={22} />}
          title="Notification Preferences"
          description="View platform notifications from the dashboard topbar."
          status="Available"
        />

        <SettingsCard
          icon={<Moon size={22} />}
          title="Appearance"
          description="Use the theme toggle in the navbar or dashboard topbar."
          status="Available"
        />

        <SettingsCard
          icon={<Shield size={22} />}
          title="Privacy Controls"
          description="Manage visibility and personal information."
          status="Coming Soon"
        />

        <SettingsCard
          icon={<Wrench size={22} />}
          title="Advanced Settings"
          description="Additional account configuration options."
          status="Coming Soon"
        />
      </div>

      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/20">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300">
          Settings Status
        </h3>

        <p className="mt-2 text-sm text-blue-800 dark:text-blue-400">
          Profile update, avatar upload, password change, notifications, and
          dark mode are already connected. Privacy and advanced preferences can
          be added later.
        </p>
      </div>
    </section>
  );
}

function SettingsCard({ icon, title, description, status, to }) {
  const content = (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          {icon}
        </div>

        <div>
          <h3 className="font-bold text-slate-950 dark:text-white">{title}</h3>

          <span
            className={`text-xs font-semibold ${
              status === "Available"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}

export default SettingsPage;
