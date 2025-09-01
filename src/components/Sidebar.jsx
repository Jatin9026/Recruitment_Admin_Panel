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
  ChevronDown,
} from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/slot", label: "Slots", icon: Clock },
  { path: "/applicants/list", label: "Applicants", icon: Users },
  { path: "/attendance/check-in", label: "Attendance", icon: ClipboardList },
  { path: "/groups/list", label: "Group Discussion", icon: UsersRound },
  { path: "/screening", label: "Screening", icon: FileText },

  // Dropdown Item for Interviews
  {
    label: "Interviews",
    icon: CheckCircle,
    children: [
      { path: "/interview/tech", label: "Tech" },
      { path: "/interview/graphics", label: "Graphics" },
      { path: "/interview/pr", label: "PR" },
      { path: "/interview/cr", label: "CR" },
      { path: "/interview/events", label: "Events" },
    ],
  },

  { path: "/mail/templates", label: "Mail Templates", icon: Mail },
  { path: "/mail/bulk", label: "Bulk Mail", icon: Inbox },
  { path: "/tasks/list", label: "Tasks", icon: ClipboardList },
];

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed  top-4 left-4 z-50 bg-white p-2 rounded-md shadow border hover:bg-gray-100 transition"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Sidebar"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
  className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 
    bg-white dark:bg-gray-900 shadow-md border-r 
    flex flex-col z-40 transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
>
        <nav className="flex-1 overflow-y-auto scrollbar-hide p-3">
          <ul className="space-y-1">
            {menuItems.map(({ path, label, icon: Icon, children }) => {
              const isActive =
                path === "/"
                  ? location.pathname === "/"
                  : path && location.pathname.startsWith(path);

              if (children) {
                return (
                  <li key={label}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        text-gray-700 dark:text-gray-300
                        ${dropdownOpen ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""}
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} />
                        {label}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {dropdownOpen && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={`block p-2 rounded-md transition-colors
                                hover:bg-gray-100 dark:hover:bg-gray-700
                                text-gray-600 dark:text-gray-300
                                ${
                                  location.pathname.startsWith(child.path)
                                    ? "bg-gray-200 dark:bg-gray-700 font-semibold"
                                    : ""
                                }
                              `}
                              onClick={() => setOpen(false)}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

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
