import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Layers, Users, UsersRound, ArrowRight } from "lucide-react";
import { useEndeavourAuthStore } from "../../../store/endeavourAuthStore";
import { ENDEAVOUR_PATHS } from "../../../modules/endeavour/paths";

const sampleStats = [
  {
    title: "Registered Users",
    value: "1,248",
    subtitle: "Sample dashboard metric",
    icon: Users,
    accent: "from-emerald-600 to-emerald-500",
  },
  {
    title: "Participants",
    value: "942",
    subtitle: "Sample dashboard metric",
    icon: Activity,
    accent: "from-cyan-600 to-cyan-500",
  },
  {
    title: "Teams",
    value: "312",
    subtitle: "Sample dashboard metric",
    icon: UsersRound,
    accent: "from-indigo-600 to-indigo-500",
  },
  {
    title: "Live Events",
    value: "9",
    subtitle: "Sample dashboard metric",
    icon: Layers,
    accent: "from-orange-600 to-orange-500",
  },
];

const quickLinks = [
  {
    label: "View Registered Users",
    description: "Fetches /api/v1/admin/users",
    to: ENDEAVOUR_PATHS.users,
  },
  {
    label: "View Participant Profiles",
    description: "Fetches /api/v1/admin/participants/full",
    to: ENDEAVOUR_PATHS.participants,
  },
  {
    label: "View Team Profiles",
    description: "Fetches /api/v1/admin/teams/full",
    to: ENDEAVOUR_PATHS.teams,
  },
];

export default function EndeavourDashboard() {
  const user = useEndeavourAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Endeavour Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          API endpoints for dashboard summaries are not available yet, so this section currently shows sample
          metrics while list/detail modules are fully integrated.
        </p>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Logged in as <span className="font-semibold">{user?.name || "Endeavour Admin"}</span> ({user?.email || "unknown"})
        </div>
      </motion.section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sampleStats.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className={`inline-flex rounded-lg bg-gradient-to-br p-2 text-white ${item.accent}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm text-slate-500">{item.title}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
          </motion.article>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">Live Admin Modules</h2>
        <p className="mt-1 text-sm text-slate-600">These sections are integrated with your Endeavour admin APIs.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
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
      </motion.section>
    </div>
  );
}
