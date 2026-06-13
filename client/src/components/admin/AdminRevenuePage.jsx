import { IndianRupee, Receipt, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import AdminAnalyticsList from "../../components/admin/AdminAnalyticsList";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import { getAdminRevenueAnalytics } from "../../services/adminService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function AdminRevenuePage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadRevenue = async () => {
    try {
      setError("");

      const data = await getAdminRevenueAnalytics();

      setAnalytics(data.analytics);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load revenue analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading revenue analytics...
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        badge="Revenue Analytics"
        title="Platform Revenue"
        description="Track paid orders, total earnings, average order value, and top revenue courses."
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard
          title="Total Revenue"
          value={formatCurrency(analytics?.totalRevenue)}
          subtitle="Total platform earnings"
          icon={IndianRupee}
        />

        <AdminStatCard
          title="Paid Orders"
          value={analytics?.totalPaidOrders || 0}
          subtitle="Successful paid purchases"
          icon={Receipt}
        />

        <AdminStatCard
          title="Average Order Value"
          value={formatCurrency(analytics?.averageOrderValue)}
          subtitle="Average revenue per paid order"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminAnalyticsList
          title="Top Revenue Courses"
          items={(analytics?.topRevenueCourses || []).map((item) => ({
            label: item.title,
            value: formatCurrency(item.revenue),
          }))}
        />

        <AdminAnalyticsList
          title="Revenue Last 30 Days"
          items={(analytics?.revenueLast30Days || []).map((item) => ({
            label: item.date,
            value: `${formatCurrency(item.revenue)} • ${item.orders} orders`,
          }))}
        />
      </div>
    </section>
  );
}

export default AdminRevenuePage;
