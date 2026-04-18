import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Shield, Sparkles } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useIdeatexAuthStore } from "../../store/ideatexAuthStore";
import { useEndeavourAuthStore } from "../../store/endeavourAuthStore";
import { RECRUITMENT_PATHS } from "../../modules/recruitment/paths";
import { IDEATEX_PATHS } from "../../modules/ideatex/paths";
import { ENDEAVOUR_PATHS } from "../../modules/endeavour/paths";

const eventCards = [
  {
    key: "recruitment",
    name: "Recruitment",
    shortName: "RC",
    description: "Manage screening, interviews, slots, groups, tasks, and administrative operations.",
    route: RECRUITMENT_PATHS.root,
    loginRoute: RECRUITMENT_PATHS.login,
    emphasis: "High-volume flow",
  },
  {
    key: "ideatex",
    name: "Ideatex",
    shortName: "IT",
    description: "Oversee teams, coordinators, panel assignments, and event settings.",
    route: IDEATEX_PATHS.root,
    loginRoute: IDEATEX_PATHS.login,
    emphasis: "Coordination flow",
  },
  {
    key: "endeavour",
    name: "Endeavour",
    shortName: "EN",
    description: "Control centre scaffold is ready with dedicated route and login flow.",
    route: ENDEAVOUR_PATHS.root,
    loginRoute: ENDEAVOUR_PATHS.login,
    emphasis: "Expansion flow",
  },
];

export default function ControlCenter() {
  const recruitmentAuth = useAuthStore((state) => state.isAuthenticated);
  const ideatexAuth = useIdeatexAuthStore((state) => state.isAuthenticated);
  const endeavourAuth = useEndeavourAuthStore((state) => state.isAuthenticated);

  const authStateMap = {
    recruitment: recruitmentAuth,
    ideatex: ideatexAuth,
    endeavour: endeavourAuth,
  };

  const activeSessions = Object.values(authStateMap).filter(Boolean).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#110203] text-white font-caldina">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 500px at 12% -8%, rgba(39, 2, 6, 0.75), transparent 56%), radial-gradient(850px 420px at 88% 0%, rgba(39, 2, 6, 0.62), transparent 58%), linear-gradient(160deg, #0d0101 0%, #180204 45%, #0f0102 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg, rgba(255,255,255,0.09) 0, rgba(255,255,255,0.09) 1px, transparent 1px, transparent 22px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-10 rounded-3xl border border-[#3a0b10] bg-[#170304]/70 p-7 backdrop-blur-xl sm:p-9"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-[#5a1720]/70 bg-[#270206]/55 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#f0d9dc]">
            <Sparkles className="h-4 w-4" />
            Operations Control Centre
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Manage Every Event From a Single Command Deck
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#dcbfc2] sm:text-lg">
            Each event runs on its own route namespace and dedicated login, while this page gives a
            clear, low-noise view of where to go next.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#4a1119] bg-[#200406]/65 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#bf9198]">Event Modules</p>
              <p className="mt-2 text-2xl font-semibold text-white">3</p>
            </div>
            <div className="rounded-2xl border border-[#4a1119] bg-[#200406]/65 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#bf9198]">Active Sessions</p>
              <p className="mt-2 text-2xl font-semibold text-white">{activeSessions}</p>
            </div>
            <div className="rounded-2xl border border-[#4a1119] bg-[#200406]/65 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#bf9198]">Access Model</p>
              <p className="mt-2 text-2xl font-semibold text-white">Isolated</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {eventCards.map((event, index) => {
            const isAuthenticated = authStateMap[event.key];
            const ctaLabel = isAuthenticated ? `Open ${event.name}` : `Login to ${event.name}`;
            const ctaRoute = isAuthenticated ? event.route : event.loginRoute;

            return (
              <motion.article
                key={event.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.4, delay: index * 0.09 }}
                className="group relative overflow-hidden rounded-3xl border border-[#3f0e14] bg-[#190304]/76 p-6 backdrop-blur-xl"
              >
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#270206]/75 to-transparent" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#5a1720] bg-[#270206]/80 text-sm font-semibold tracking-[0.14em] text-[#f4d8db]">
                    {event.shortName}
                  </div>
                  <span className="inline-flex items-center rounded-full border border-[#5a1720] bg-[#250508]/75 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#d8b3b8]">
                    {event.emphasis}
                  </span>
                </div>

                <div className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-[#4f131b] bg-[#240508]/70 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#d2a5ab]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Event Workspace
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-white">{event.name}</h2>
                <p className="mt-3 min-h-20 text-sm leading-6 text-[#d5b8bc]">{event.description}</p>

                <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {isAuthenticated ? "Session active" : "Authentication required"}
                  </span>
                </div>

                <Link
                  to={ctaRoute}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#5a1720] bg-[#270206]/80 px-4 py-3 text-sm font-medium text-[#f7e6e8] transition-colors duration-300 hover:bg-[#3b0a0f]"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="mt-4 space-y-1 text-xs text-[#b98b91]">
                  <p>Route: {event.route}</p>
                  <p>Login: {event.loginRoute}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
