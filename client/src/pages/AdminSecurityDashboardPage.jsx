import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Monitor,
  History,
  Lock,
  Activity,
} from "lucide-react";
import {
  getAuditLogs,
  getLoginSecurityLogs,
  getSecurityDashboard,
} from "../services/securityService";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value ?? 0}
          </h3>
        </div>
        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function AdminSecurityDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      const [dashboardData, auditData, loginData] = await Promise.all([
        getSecurityDashboard(),
        getAuditLogs({ limit: 10 }),
        getLoginSecurityLogs({ limit: 10 }),
      ]);

      setDashboard(dashboardData.security);
      setAuditLogs(auditData.logs || []);
      setLoginLogs(loginData.logs || []);
    } catch (error) {
      console.error("Security dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-300">
        Loading security dashboard...
      </div>
    );
  }

  const summary = dashboard?.summary || {};

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          Admin Security
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Security Monitoring Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor failed logins, active sessions, audit logs, and sensitive
          admin actions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={AlertTriangle}
          label="Failed Logins 24h"
          value={summary.failedLogins24h}
        />
        <StatCard
          icon={ShieldCheck}
          label="Successful Logins 24h"
          value={summary.successfulLogins24h}
        />
        <StatCard
          icon={Monitor}
          label="Active Sessions"
          value={summary.activeSessions}
        />
        <StatCard
          icon={Lock}
          label="Expired Sessions"
          value={summary.expiredSessions}
        />
        <StatCard
          icon={Activity}
          label="Audit Logs 24h"
          value={summary.auditLogs24h}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <History className="text-emerald-600" size={20} />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Recent Audit Logs
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2">Action</th>
                  <th className="py-2">Actor</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {log.actor?.email || "System"}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {auditLogs.length === 0 && (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan="4">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={20} />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Recent Login Logs
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2">Email</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Device</th>
                  <th className="py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 text-slate-800 dark:text-slate-200">
                      {log.email}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          log.status === "success"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {log.deviceName || "Unknown"}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {loginLogs.length === 0 && (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan="4">
                      No login logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
          Top Failed Login Emails
        </h2>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(dashboard?.topFailedLoginEmails || []).map((item) => (
            <div
              key={item.email}
              className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
            >
              <p className="font-medium text-slate-900 dark:text-white">
                {item.email}
              </p>
              <p className="text-sm text-slate-500">
                Failed attempts: {item.count}
              </p>
            </div>
          ))}

          {(dashboard?.topFailedLoginEmails || []).length === 0 && (
            <p className="text-sm text-slate-500">
              No suspicious failed login pattern found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminSecurityDashboardPage;
