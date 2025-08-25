// Navbar.jsx
import React from "react";

// Role hierarchy
const ROLE = {
  MEMBER: 1,
  PROCTOR: 2,
  INTERVIEWER: 3,
  ADMIN: 4,
  SUPER: 5,
};

// All navigation items with minimum role
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
  { path: "/audit", label: "Audit Log", minRole: ROLE.ADMIN }, // view-only for Admin, purge for Super
  { path: "/settings", label: "Settings", minRole: ROLE.SUPER },
];

export default function Navbar({ user }) {
  if (!user) return null; // no navbar before login

  const roleLevel = ROLE[user.role?.toUpperCase()] || ROLE.MEMBER;

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-md">
      <ul className="flex gap-6">
        {NAV_ITEMS.filter(item => roleLevel >= item.minRole).map(item => (
          <li key={item.path}>
            <a
              href={item.path}
              className="hover:text-yellow-400 transition-colors font-medium"
            >
              {item.label}
            </a>
          </li>
        ))}
        <li className="ml-auto">
          <a
            href="/logout"
            className="hover:text-red-400 transition-colors font-medium"
          >
            Logout
          </a>
        </li>
      </ul>
    </nav>
  );
}
