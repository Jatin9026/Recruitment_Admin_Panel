import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  UsersRound,
  FileText,
  Mail,
  CheckCircle,
  Inbox,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/slot", label: "Slots", icon: Clock }, // ✅ fixed
  { path: "/applicants/list", label: "Applicants", icon: Users },
  { path: "/attendance/check-in", label: "Attendance", icon: ClipboardList },
  { path: "/groups/list", label: "Group Discussion", icon: UsersRound },
  { path: "/screening", label: "Screening", icon: FileText },
  { path: "/interview/domain", label: "Interviews", icon: CheckCircle },
  { path: "/mail/templates", label: "Mail Templates", icon: Mail },
  { path: "/mail/bulk", label: "Bulk Mail", icon: Inbox },
  { path: "/tasks/list", label: "Tasks", icon: ClipboardList },
];

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button for small screens */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow border hover:bg-gray-100 transition"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Sidebar"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-md border-r flex flex-col transition-transform duration-300 z-40
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <nav className="flex-1 overflow-y-auto scrollbar-hide p-3">
          <ul className="space-y-1">
            {menuItems.map(({ path, label, icon: Icon }) => {
              const isActive =
                path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(path);
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      text-gray-700 dark:text-gray-300
                      ${isActive ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""}
                    `}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <style>
        {`
          /* Hide scrollbar but keep scroll functionality */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>
    </>
  );
}
