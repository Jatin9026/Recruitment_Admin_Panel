import React from "react";
import { Link } from "react-router-dom";
import { Activity, AlertCircle, ArrowRight, Layers, RefreshCw, Users, UsersRound } from "lucide-react";
import { useEndeavourAuthStore } from "../../../store/endeavourAuthStore";
import { ENDEAVOUR_PATHS } from "../../../modules/endeavour/paths";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const PARTICIPANTS_INCLUDE = "team,events,attendance";
const TEAMS_INCLUDE = "members,events,attendance";
const PAGE_SIZE = 100;

const quickLinks = [
  {
    label: "Ecell Members",
    description: "GET /api/v1/ecell/ecell-members",
    to: ENDEAVOUR_PATHS.ecellMembers,
  },
  {
    label: "Roles and Access",
    description: "POST /api/v1/admin/roles/grant|revoke",
    to: ENDEAVOUR_PATHS.roles,
  },
  {
    label: "Participant Profiles",
    description: "GET /api/v1/admin/participants/full",
    to: ENDEAVOUR_PATHS.participants,
  },
  {
    label: "Team Profiles",
    description: "GET /api/v1/admin/teams/full",
    to: ENDEAVOUR_PATHS.teams,
  },
  {
    label: "Runtime Settings",
    description: "GET|PUT /api/v1/admin/settings",
    to: ENDEAVOUR_PATHS.settings,
  },
  {
    label: "Event Operations",
    description: "Events, coordinators, promotions, slots",
    to: ENDEAVOUR_PATHS.events,
  },
];

export default function EndeavourDashboard() {
  const user = useEndeavourAuthStore((state) => state.user);

  const [stats, setStats] = React.useState({
    totalParticipants: 0,
    totalTeams: 0,
    activeEvents: 0,
    participantsWithTeams: 0,
    participantsWithoutTeams: 0,
    averageTeamSize: 0,
    attendanceCoveragePercent: 0,
    eventsPerParticipant: 0,
    teamsWithAttendance: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [warnings, setWarnings] = React.useState([]);
  const [lastUpdated, setLastUpdated] = React.useState("");

  const fetchAllParticipantPages = React.useCallback(async () => {
    let page = 1;
    let hasNext = true;
    let total = 0;
    const allParticipants = [];

    while (hasNext) {
      const response = await endeavourApiClient.getParticipantsFull({
        page,
        pageSize: PAGE_SIZE,
        includeInactive: true,
        include: PARTICIPANTS_INCLUDE,
      });

      const data = response?.data || {};
      const participants = Array.isArray(data?.participants) ? data.participants : [];
      const pagination = data?.pagination || {};

      allParticipants.push(...participants);
      total = Number(pagination?.total || total || 0);
      hasNext = Boolean(pagination?.has_next);
      page += 1;

      if (page > 200) {
        break;
      }
    }

    return {
      items: allParticipants,
      total: total || allParticipants.length,
    };
  }, []);

  const fetchAllTeamPages = React.useCallback(async () => {
    let page = 1;
    let hasNext = true;
    let total = 0;
    const allTeams = [];

    while (hasNext) {
      const response = await endeavourApiClient.getTeamsFull({
        page,
        pageSize: PAGE_SIZE,
        include: TEAMS_INCLUDE,
      });

      const data = response?.data || {};
      const teams = Array.isArray(data?.teams) ? data.teams : [];
      const pagination = data?.pagination || {};

      allTeams.push(...teams);
      total = Number(pagination?.total || total || 0);
      hasNext = Boolean(pagination?.has_next);
      page += 1;

      if (page > 200) {
        break;
      }
    }

    return {
      items: allTeams,
      total: total || allTeams.length,
    };
  }, []);

  const calculateStatsFromPayload = React.useCallback((participantsPayload, teamsPayload) => {
    const participants = participantsPayload?.items || [];
    const teams = teamsPayload?.items || [];

    const totalParticipants = participantsPayload?.total || participants.length;
    const totalTeams = teamsPayload?.total || teams.length;

    const participantsWithTeams = participants.filter((entry) => Array.isArray(entry?.teams) && entry.teams.length > 0).length;
    const participantsWithoutTeams = Math.max(0, totalParticipants - participantsWithTeams);

    const totalTeamMembers = teams.reduce((sum, entry) => {
      return sum + (Array.isArray(entry?.members) ? entry.members.length : 0);
    }, 0);
    const averageTeamSize = totalTeams > 0 ? totalTeamMembers / totalTeams : 0;

    const participantsWithAttendance = participants.filter(
      (entry) => Array.isArray(entry?.attendance) && entry.attendance.length > 0
    ).length;

    const totalParticipantEventLinks = participants.reduce((sum, entry) => {
      return sum + (Array.isArray(entry?.events) ? entry.events.length : 0);
    }, 0);

    const attendanceCoveragePercent = totalParticipants > 0 ? (participantsWithAttendance / totalParticipants) * 100 : 0;
    const eventsPerParticipant = totalParticipants > 0 ? totalParticipantEventLinks / totalParticipants : 0;

    const teamsWithAttendance = teams.filter((entry) => Array.isArray(entry?.attendance) && entry.attendance.length > 0).length;

    const activeEventIds = new Set();
    participants.forEach((entry) => {
      if (!Array.isArray(entry?.events)) {
        return;
      }
      entry.events.forEach((event) => {
        if (event?.id) {
          activeEventIds.add(event.id);
        }
      });
    });

    teams.forEach((entry) => {
      if (entry?.team?.event_id) {
        activeEventIds.add(entry.team.event_id);
      }
      if (entry?.event?.id) {
        activeEventIds.add(entry.event.id);
      }
    });

    return {
      totalParticipants,
      totalTeams,
      activeEvents: activeEventIds.size,
      participantsWithTeams,
      participantsWithoutTeams,
      averageTeamSize,
      attendanceCoveragePercent,
      eventsPerParticipant,
      teamsWithAttendance,
    };
  }, []);

  const fetchDashboardMetrics = React.useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");
        setWarnings([]);

        const [participantsResult, teamsResult] = await Promise.allSettled([
          fetchAllParticipantPages(),
          fetchAllTeamPages(),
        ]);

        const warningList = [];

        const participantsPayload = participantsResult.status === "fulfilled"
          ? participantsResult.value
          : { items: [], total: 0 };
        if (participantsResult.status === "rejected") {
          warningList.push(`Participants API: ${participantsResult.reason?.message || "Failed"}`);
        }

        const teamsPayload = teamsResult.status === "fulfilled"
          ? teamsResult.value
          : { items: [], total: 0 };
        if (teamsResult.status === "rejected") {
          warningList.push(`Teams API: ${teamsResult.reason?.message || "Failed"}`);
        }

        if (warningList.length === 2) {
          throw new Error("Unable to load dashboard metrics. All data sources failed.");
        }

        setStats(calculateStatsFromPayload(participantsPayload, teamsPayload));
        setWarnings(warningList);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        setError(err?.message || "Unable to load dashboard metrics");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [calculateStatsFromPayload, fetchAllParticipantPages, fetchAllTeamPages]
  );

  React.useEffect(() => {
    fetchDashboardMetrics({ showLoader: true });
  }, [fetchDashboardMetrics]);

  const metricCards = [
    {
      title: "Participants",
      value: stats.totalParticipants,
      subtitle: "GET /admin/participants/full",
      icon: Activity,
      accent: "from-cyan-600 to-cyan-500",
    },
    {
      title: "Teams",
      value: stats.totalTeams,
      subtitle: "GET /admin/teams/full",
      icon: UsersRound,
      accent: "from-indigo-600 to-indigo-500",
    },
    {
      title: "Active Events",
      value: stats.activeEvents,
      subtitle: "Derived from events across participants and teams",
      icon: Layers,
      accent: "from-orange-600 to-orange-500",
    },
    {
      title: "Participants with Teams",
      value: stats.participantsWithTeams,
      subtitle: "Engagement KPI",
      icon: Users,
      accent: "from-lime-600 to-lime-500",
    },
    {
      title: "Participants without Teams",
      value: stats.participantsWithoutTeams,
      subtitle: "Engagement KPI",
      icon: Users,
      accent: "from-rose-600 to-rose-500",
    },
    {
      title: "Average Team Size",
      value: stats.averageTeamSize.toFixed(2),
      subtitle: "Total members / total teams",
      icon: UsersRound,
      accent: "from-blue-600 to-blue-500",
    },
    {
      title: "Attendance Coverage",
      value: `${stats.attendanceCoveragePercent.toFixed(1)}%`,
      subtitle: "Participants with attendance",
      icon: Activity,
      accent: "from-violet-600 to-violet-500",
    },
    {
      title: "Events per Participant",
      value: stats.eventsPerParticipant.toFixed(2),
      subtitle: "Total participant-event links / participants",
      icon: Layers,
      accent: "from-amber-600 to-amber-500",
    },
    {
      title: "Teams with Attendance",
      value: stats.teamsWithAttendance,
      subtitle: "Teams having attendance records",
      icon: UsersRound,
      accent: "from-teal-600 to-teal-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Endeavour Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Live metrics are calculated from participants full profiles and teams full profiles APIs.</p>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Logged in as <span className="font-semibold">{user?.name || "Endeavour Admin"}</span> ({user?.email || "unknown"})
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fetchDashboardMetrics({ showLoader: false })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Metrics
          </button>
          <span className="text-xs text-slate-500">Last updated: {lastUpdated || "-"}</span>
        </div>
      </section>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm text-slate-600">Calculating dashboard metrics...</p>
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className={`inline-flex rounded-lg bg-gradient-to-br p-2 text-white ${item.accent}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm text-slate-500">{item.title}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
            </article>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="text-sm font-semibold">Partial data warning</p>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Live Admin Modules</h2>
        <p className="mt-1 text-sm text-slate-600">These sections are currently implemented and integrated with Endeavour admin APIs.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
