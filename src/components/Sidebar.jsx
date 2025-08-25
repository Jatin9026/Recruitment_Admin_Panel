
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  UsersRound,
  FileText,
  Mail,
  Settings,
  CheckCircle,
  Inbox,
  Database,
} from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },  
  { path: "/applicants/list", label: "Applicants", icon: Users },
  { path: "/attendance/check-in", label: "Attendance", icon: ClipboardList },
  { path: "/groups/list", label: "Groups", icon: UsersRound },

  { path: "/screening", label: "Screening", icon: FileText }, 
  { path: "/interview/domain", label: "Interviews", icon: CheckCircle },
  { path: "/slots/manage", label: "Slots", icon: Clock },
  { path: "/mail/templates", label: "Mail Templates", icon: Mail },
  { path: "/mail/bulk", label: "Bulk Mail", icon: Inbox },
  { path: "/tasks/list", label: "Tasks", icon: ClipboardList },
];
export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 bg-white shadow-md h-screen flex flex-col">
      <div className="p-4 font-bold text-xl border-b">Admin Panel</div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 ${
                  location.pathname.startsWith(path) ? "bg-gray-200 font-semibold" : ""
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
