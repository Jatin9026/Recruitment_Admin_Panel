import React from "react";


const rolePriority = {
  MEMBER: 1,
  PROCTOR: 2,
  INTERVIEWER: 3,
  ADMIN: 4,
  SUPER: 5,
};


const navItems = [
  { label: "Dashboard", href: "/dashboard", minRole: 1 },
  { label: "Applicants", href: "/applicants/list", minRole: 1 },
  { label: "Attendance", href: "/attendance/check", minRole: 1 },
  { label: "Groups", href: "/groups", minRole: 2 },
  { label: "Screening", href: "/screening/pending", minRole: 5 },
  { label: "Interviews", href: "/interviews/assigned", minRole: 3 },
  { label: "Slots", href: "/slots/manage", minRole: 4 },
  { label: "Mail", href: "/mail/bulk", minRole: 4 },
  { label: "Tasks", href: "/tasks/list", minRole: 4 },
  { label: "Audit", href: "/audit", minRole: 5 },
  { label: "Settings", href: "/settings", minRole: 5 },
];

export default function Tobbar({ user }) {
  const userRole = user?.role || "MEMBER";
  const userLevel = rolePriority[userRole];

  return (
    <nav className="w-full bg-gray-900 text-white shadow-md px-6 py-3 flex items-center justify-between">

      <div className="text-xl font-bold tracking-wide">
        Club Recruitment Panel
      </div>


      <ul className="flex space-x-6">
        {navItems
          .filter((item) => userLevel >= item.minRole)
          .map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="hover:text-yellow-300 transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
      </ul>


      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-300">
          {user?.name} ({user?.role})
        </span>
        <a
          href="/auth/logout"
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
        >
          Logout
        </a>
      </div>
    </nav>
  );
}
