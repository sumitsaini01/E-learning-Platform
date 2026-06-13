import { Settings, Shield } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";

function AdminSettingsPage() {
  return (
    <section className="space-y-6">
      <AdminPageHeader
        badge="Admin Settings"
        title="Platform Settings"
        description="Manage admin preferences and platform-level settings."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Settings className="text-blue-600 dark:text-blue-400" size={22} />

          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            General Settings
          </h2>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Admin settings UI is ready. Backend preferences can be connected
          later.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Shield className="text-blue-600 dark:text-blue-400" size={22} />

          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Security Controls
          </h2>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Role protection, verification controls, and account moderation are
          already handled from the Users page.
        </p>
      </div>
    </section>
  );
}

export default AdminSettingsPage;
