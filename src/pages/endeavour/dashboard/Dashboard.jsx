import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, RefreshCw, Users, UsersRound, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { useEndeavourAuthStore } from "../../../store/endeavourAuthStore";
import { ENDEAVOUR_PATHS } from "../../../modules/endeavour/paths";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const quickLinks = [
  {
    label: "Event Operations",
    description: "Manage events, coordinators, promotions, and slots",
    to: ENDEAVOUR_PATHS.events,
  },
  {
    label: "Participant Profiles",
    description: "View and manage participant information",
    to: ENDEAVOUR_PATHS.participants,
  },
  {
    label: "Team Profiles",
    description: "View and manage team information",
    to: ENDEAVOUR_PATHS.teams,
  },
];

export default function EndeavourDashboard() {
  const user = useEndeavourAuthStore((state) => state.user);

  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [lastUpdated, setLastUpdated] = React.useState("");

  const fetchDashboardData = React.useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await endeavourApiClient.getDashboardStats();
        const data = response?.data || {};

        setDashboardData(data);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        setError(err?.message || "Unable to load dashboard metrics");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchDashboardData({ showLoader: true });
  }, [fetchDashboardData]);

  const teams = dashboardData?.teams || {};
  const orders = dashboardData?.orders || {};
  const eventWiseData = dashboardData?.teams?.by_event || [];
  const paidAmount = Number(orders.paid_amount || 0);
  const totalEventTeams = eventWiseData.reduce((sum, item) => sum + Number(item?.total || 0), 0);

  const statCards = [
    {
      title: "Total Registered Users",
      value: dashboardData?.users?.total || 0,
      subtitle: "All registered users",
      icon: Users,
      accent: "from-blue-600 to-blue-500",
    },
    {
      title: "Event Registrations",
      value: eventWiseData.length,
      subtitle: "Events with team registrations",
      icon: TrendingUp,
      accent: "from-purple-600 to-purple-500",
    },
    {
      title: "Total Teams",
      value: dashboardData?.teams?.total || 0,
      subtitle: "Teams formed across all events",
      icon: UsersRound,
      accent: "from-indigo-600 to-indigo-500",
    },
    {
      title: "Paid Amount",
      value: `₹${paidAmount.toFixed(2)}`,
      subtitle: "Total amount collected",
      icon: DollarSign,
      accent: "from-emerald-600 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Endeavour Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">Real-time event registration statistics and financial overview.</p>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Logged in as <span className="font-semibold">{user?.name || "Endeavour Admin"}</span> ({user?.email || "unknown"})
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fetchDashboardData({ showLoader: false })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
          <span className="text-xs text-slate-500 sm:ml-1">Last updated: {lastUpdated || "-"}</span>
        </div>
      </section>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm text-slate-600">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Unable to load dashboard</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article
                key={card.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className={`inline-flex rounded-lg bg-gradient-to-br p-2 text-white ${card.accent}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm text-slate-500">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
              </article>
            ))}
          </div>

          {/* Event-wise Registration Data */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Event-wise Team Registration</h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">Total teams formed per event</p>

            {eventWiseData && eventWiseData.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Event Name</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Teams</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventWiseData.map((item) => (
                      <tr key={item.event_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700 font-medium">{item.event_name || item.event_id}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center justify-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                            {item.total}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Row */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
                  <span className="font-semibold text-slate-900">Total Teams Across Events</span>
                  <span className="font-semibold text-slate-900">{totalEventTeams}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                <p className="text-sm">No event-wise registration data available</p>
              </div>
            )}
          </section>

          {/* Orders Summary */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Payment Summary</h2>
            <p className="mt-1 text-sm text-slate-600">Financial overview of event registrations</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-600">Paid Amount</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">₹{paidAmount.toFixed(2)}</p>
                <p className="mt-1 text-sm text-slate-600">Only the collected amount is shown here</p>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Quick Access</h2>
            <p className="mt-1 text-sm text-slate-600">Navigate to commonly used admin modules</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                  <p className="mt-1 text-xs text-slate-600">{link.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                    Open
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
