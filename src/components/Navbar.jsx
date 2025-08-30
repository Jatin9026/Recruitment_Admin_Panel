import React, { useEffect, useState } from "react";

const ROLE = {
  MEMBER: 1,
  PROCTOR: 2,
  INTERVIEWER: 3,
  ADMIN: 4,
  SUPER: 5,
};

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", minRole: ROLE.MEMBER },
  { path: "/applicants/list", label: "Applicants", minRole: ROLE.MEMBER },
  { path: "/attendance/check", label: "Attendance", minRole: ROLE.MEMBER },
  { path: "/groups/queue", label: "Queue", minRole: ROLE.MEMBER },
  { path: "/groups", label: "Groups", minRole: ROLE.PROCTOR },
  { path: "/screening/pending", label: "Screening", minRole: ROLE.SUPER },
  { path: "/interviews/assigned", label: "Interviews", minRole: ROLE.INTERVIEWER },
  { path: "/slots/manage", label: "Slots", minRole: ROLE.ADMIN },
  { path: "/mail/templates", label: "Mail Templates", minRole: ROLE.ADMIN },
  { path: "/mail/bulk", label: "Bulk Mail", minRole: ROLE.ADMIN },
  { path: "/tasks/list", label: "Tasks", minRole: ROLE.ADMIN },
  { path: "/audit", label: "Audit Log", minRole: ROLE.ADMIN },
  { path: "/settings", label: "Settings", minRole: ROLE.SUPER },
];

export default function Navbar({ user }) {
  if (!user) return null;

  const roleLevel = ROLE[user.role?.toUpperCase()] || ROLE.MEMBER;

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 shadow-md flex flex-wrap items-center gap-4">
      <div className="font-mono text-yellow-400 text-lg flex-shrink-0">
        {time.toLocaleTimeString()}
      </div>

      <ul className="flex flex-wrap gap-6 flex-grow">
        {NAV_ITEMS.filter((item) => roleLevel >= item.minRole).map((item) => (
          <li key={item.path}>
            <a
              href={item.path}
              className="font-semibold hover:text-yellow-400 transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <a
        href="/logout"
        className="ml-auto font-semibold text-red-400 hover:text-red-500 transition-colors whitespace-nowrap"
      >
        Logout
      </a>
    </nav>
  );
}
