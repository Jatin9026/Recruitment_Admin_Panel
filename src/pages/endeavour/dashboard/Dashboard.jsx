import React from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Users,
  UsersRound,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calculator,
} from "lucide-react";
import { useEndeavourAuthStore } from "../../../store/endeavourAuthStore";
import { ENDEAVOUR_PATHS } from "../../../modules/endeavour/paths";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

/** Per-team registration fee by event id — source for expected payment calculations. */
const EVENT_REGISTRATION_PRICES = {
  "ipl-mania": 299,
  "treasure-hunt": 299,
  "bgmi-battle-royale": 249,
  "b-plan": 299,
  "market-watch": 249,
  "corporate-arena": 249,
  "b-quiz": 249,
  "hacktrepreneur": 399,
  "entertainment-eve": 299,
};

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

        const statsRes = await endeavourApiClient.getDashboardStats();
        const data = statsRes?.data || {};
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

  const orders = dashboardData?.orders || {};
  const eventWiseData = dashboardData?.teams?.by_event || [];
  const paidAmount = Number(orders.paid_amount || 0);
  const totalEventTeams = eventWiseData.reduce((sum, item) => sum + Number(item?.total || 0), 0);

  const teamFeeBreakdown = React.useMemo(() => {
    const rows = eventWiseData.map((item) => {
      const teamCount = Number(item?.total || 0);
      const unitPrice = EVENT_REGISTRATION_PRICES[item.event_id] ?? 0;
      const subtotal = teamCount * unitPrice;
      return {
        event_id: item.event_id,
        event_name: item.event_name || item.event_id,
        teamCount,
        unitPrice,
        subtotal,
      };
    });
    const manualTotalFromTeams = rows.reduce((sum, r) => sum + r.subtotal, 0);
    return { rows, manualTotalFromTeams };
  }, [eventWiseData]);

  const { rows: teamFeeRows, manualTotalFromTeams } = teamFeeBreakdown;
  const paymentDelta = paidAmount - manualTotalFromTeams;

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
      title: "Paid Amount (orders)",
      value: `₹${paidAmount.toFixed(2)}`,
      subtitle: "Recorded collected amount",
      icon: DollarSign,
      accent: "from-emerald-600 to-emerald-500",
    },
    {
      title: "Expected from teams",
      value: `₹${manualTotalFromTeams.toFixed(2)}`,
      subtitle: "Teams × registration fee per event",
      icon: Calculator,
      accent: "from-teal-600 to-teal-500",
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

          {/* Expected payment from team counts × fee */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-slate-900">Expected payment by event</h2>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Total expected:{" "}
                <span className="text-teal-700">₹{manualTotalFromTeams.toFixed(2)}</span>
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Each row is teams × that event&apos;s registration fee defined in EVENT_REGISTRATION_PRICES at the top of this file.
            </p>

            {teamFeeRows.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Event</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Teams</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Fee / team (₹)</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Expected (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamFeeRows.map((row) => (
                      <tr key={row.event_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-700">{row.event_name}</td>
                        <td className="px-4 py-3 text-right text-slate-800">{row.teamCount}</td>
                        <td className="px-4 py-3 text-right text-slate-800">{row.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          ₹{row.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-slate-900">Sum of event expected amounts</span>
                  <span className="font-semibold text-teal-800">₹{manualTotalFromTeams.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                <p className="text-sm">No team data to calculate expected payments</p>
              </div>
            )}
          </section>

          {/* Orders Summary */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Payment Summary</h2>
            <p className="mt-1 text-sm text-slate-600">
              Compare order totals with the manual expected total from team registrations.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-600">Paid amount (orders)</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">₹{paidAmount.toFixed(2)}</p>
                <p className="mt-1 text-sm text-slate-600">Amount recorded as collected on orders</p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-teal-800">Expected (teams × fee)</p>
                <p className="mt-2 text-2xl font-bold text-teal-900">₹{manualTotalFromTeams.toFixed(2)}</p>
                <p className="mt-1 text-sm text-teal-800/90">Uses dashboard team counts and fixed fees in code</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold uppercase text-slate-600">Difference (paid − expected)</p>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    Math.abs(paymentDelta) < 0.01 ? "text-slate-900" : paymentDelta > 0 ? "text-amber-700" : "text-rose-700"
                  }`}
                >
                  ₹{paymentDelta.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Positive means collected exceeds team-based expectation; negative means the opposite.
                </p>
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
