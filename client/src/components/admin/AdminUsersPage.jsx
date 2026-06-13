import { useEffect, useState } from "react";

import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminRecentUsers from "../../components/admin/AdminRecentUsers";

import {
  deleteAdminUser,
  getAdminUsers,
  updateUserRole,
  updateUserVerificationStatus,
} from "../../services/adminService";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      setUpdatingUserId(userId);

      const data = await updateUserRole(userId, role);

      setSuccess(data.message);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleVerificationChange = async (userId, isEmailVerified) => {
    try {
      setUpdatingUserId(userId);

      const data = await updateUserVerificationStatus(userId, isEmailVerified);

      setSuccess(data.message);

      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      setUpdatingUserId(userId);

      const data = await deleteAdminUser(userId);

      setSuccess(data.message);

      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setUpdatingUserId("");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        Loading users...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        badge="User Management"
        title="Manage Platform Users"
        description="Verify users, change roles, and remove accounts."
      />

      {error && (
        <div className="rounded-xl bg-red-100 p-3 text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </div>
      )}

      <AdminRecentUsers
        users={users}
        updatingUserId={updatingUserId}
        onRoleChange={handleRoleChange}
        onVerificationChange={handleVerificationChange}
        onDeleteUser={handleDeleteUser}
      />
    </section>
  );
}

export default AdminUsersPage;
