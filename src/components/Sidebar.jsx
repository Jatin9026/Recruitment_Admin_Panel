import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useIdeatexAuthStore } from "../store/ideatexAuthStore";
import { useEndeavourAuthStore } from "../store/endeavourAuthStore";
import { ROUTE_PERMISSIONS } from "../utils/rolePermissions";
import { ENDEAVOUR_ALLOWED_ROLES, hasAnyEndeavourRoleAccess } from "../utils/endeavourRoleAccess";
import { RECRUITMENT_PATHS } from "../modules/recruitment/paths";
import { IDEATEX_PATHS } from "../modules/ideatex/paths";
import { ENDEAVOUR_PATHS } from "../modules/endeavour/paths";
import {
  LayoutDashboard, Users, ClipboardList, Clock, UsersRound,
  FileText, Mail, CheckCircle, Inbox, Menu, X, ChevronDown,
  UserPlus, UserCheck, Activity, Settings, Briefcase, CreditCard,
} from "lucide-react";

const recruitmentMenuItems = [
  { path: RECRUITMENT_PATHS.dashboard, label: "Dashboard", icon: LayoutDashboard, roles: ROUTE_PERMISSIONS.dashboard },
  { path: RECRUITMENT_PATHS.slotsBulkAssign, label: "Bulk Slot Assignment", icon: Clock, roles: ROUTE_PERMISSIONS.slots },
  { path: RECRUITMENT_PATHS.slotsAttendance, label: "Slot Attendance", icon: UserCheck, roles: ROUTE_PERMISSIONS.attendance },
  { path: RECRUITMENT_PATHS.groupsList, label: "Group Discussion", icon: UsersRound, roles: ROUTE_PERMISSIONS.groups },
  { path: RECRUITMENT_PATHS.screening, label: "Screening", icon: FileText, roles: ROUTE_PERMISSIONS.screening },
  {
    label: "Interviews", icon: CheckCircle, roles: ROUTE_PERMISSIONS.interviews,
    children: [
      { path: RECRUITMENT_PATHS.interviewTech, label: "Technical" },
      { path: RECRUITMENT_PATHS.interviewGraphics, label: "Graphics" },
      { path: RECRUITMENT_PATHS.interviewPr, label: "Public Relations" },
      { path: RECRUITMENT_PATHS.interviewCr, label: "Corporate Relations" },
      { path: RECRUITMENT_PATHS.interviewEvents, label: "Events" },
    ],
  },
  { path: RECRUITMENT_PATHS.tasksList, label: "Tasks", icon: ClipboardList, roles: ROUTE_PERMISSIONS.tasks },
  { path: RECRUITMENT_PATHS.mailBulk, label: "Bulk Mail", icon: Inbox, roles: ROUTE_PERMISSIONS.bulkMail },
  { path: RECRUITMENT_PATHS.mailTemplates, label: "Mail Templates", icon: Mail, roles: ROUTE_PERMISSIONS.mailTemplates },
  { path: RECRUITMENT_PATHS.adminCreate, label: "Create Admin", icon: UserPlus, roles: ROUTE_PERMISSIONS.createAdmin },
  { path: RECRUITMENT_PATHS.adminList, label: "Admin List", icon: Users, roles: ROUTE_PERMISSIONS.adminLogs },
  { path: RECRUITMENT_PATHS.adminLogs, label: "Admin Logs", icon: Activity, roles: ROUTE_PERMISSIONS.adminLogs },
];

const ideatexMenuItems = [
  { path: IDEATEX_PATHS.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { path: IDEATEX_PATHS.teams, label: "Team Management", icon: Users },
  { path: IDEATEX_PATHS.coordinators, label: "Coordinators", icon: UserCheck },
  { path: IDEATEX_PATHS.panelAssignment, label: "Panel Assignment", icon: Briefcase },
  { path: IDEATEX_PATHS.settings, label: "Settings", icon: Settings },
];

const endeavourMenuItems = [
  { path: ENDEAVOUR_PATHS.dashboard, label: "Dashboard", icon: LayoutDashboard, roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
  { path: ENDEAVOUR_PATHS.ecellMembers, label: "Ecell Members", icon: UsersRound, roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
  { path: ENDEAVOUR_PATHS.roles, label: "Roles and Access", icon: Activity, roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
  { path: ENDEAVOUR_PATHS.participants, label: "Participants", icon: UserCheck, roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
  { path: ENDEAVOUR_PATHS.teams, label: "Teams", icon: Briefcase, roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
  { path: ENDEAVOUR_PATHS.settings, label: "Settings", icon: Settings, roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
  {
    label: "Payments",
    icon: CreditCard,
    roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly,
    children: [
      { path: ENDEAVOUR_PATHS.paymentsVerification, label: "Order Verification", roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
      { path: ENDEAVOUR_PATHS.paymentsAccounts, label: "Payment Accounts", roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
    ],
  },
  { path: ENDEAVOUR_PATHS.events, label: "Event Operations", icon: Briefcase, roles: ENDEAVOUR_ALLOWED_ROLES.eventPageAccess },
  { path: ENDEAVOUR_PATHS.auditTools, label: "Audit Tools", icon: FileText, roles: ENDEAVOUR_ALLOWED_ROLES.superadminOnly },
];

export default function Sidebar({ moduleType = "recruitment" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: recruitmentUser } = useAuthStore();
  const { user: ideatexUser } = useIdeatexAuthStore();
  const { user: endeavourUser } = useEndeavourAuthStore();

  const isIdeatex = moduleType === "ideatex";
  const isEndeavour = moduleType === "endeavour";
  const user = isIdeatex ? ideatexUser : isEndeavour ? endeavourUser : recruitmentUser;
  const menuItems = isIdeatex ? ideatexMenuItems : isEndeavour ? endeavourMenuItems : recruitmentMenuItems;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [dropdownOpen, setDropdownOpen] = useState({});

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", next.toString());
    window.dispatchEvent(
      new StorageEvent("storage", { key: "sidebarCollapsed", newValue: next.toString() })
    );
  };

  const toggleDropdown = (label) => {
    if (isCollapsed) {
      // Expand first, then open dropdown
      setIsCollapsed(false);
      localStorage.setItem("sidebarCollapsed", "false");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "sidebarCollapsed", newValue: "false" })
      );
      setTimeout(() => setDropdownOpen((prev) => ({ ...prev, [label]: true })), 100);
    } else {
      setDropdownOpen((prev) => ({ ...prev, [label]: !prev[label] }));
    }
  };

  // Only closes mobile drawer — does NOT auto-collapse desktop sidebar
  const handleMobileClose = () => setMobileOpen(false);

  const handleProfileClick = () => {
    if (isIdeatex) navigate(IDEATEX_PATHS.settings);
    else if (isEndeavour) navigate(ENDEAVOUR_PATHS.dashboard);
    else navigate(RECRUITMENT_PATHS.adminProfile);
    handleMobileClose();
  };

  const userHasAccess = (roles) => {
    if (isIdeatex) return true;
    if (isEndeavour) {
      if (!user?.role) return false;
      if (roles == null) return true;
      if (!Array.isArray(roles)) return false;
      return hasAnyEndeavourRoleAccess(user.role, roles);
    }
    if (!user?.role) return false;
    if (roles == null) return true;
    if (!Array.isArray(roles)) {
      if (import.meta.env.DEV) console.warn("Sidebar: expected roles array, got", roles);
      return false;
    }
    return roles.includes(user.role);
  };

  const renderMenuItem = (item) => {
    if (!userHasAccess(item.roles)) return null;

    const isActive = location.pathname === item.path;
    const hasChildren = item.children?.length > 0;
    const isDropdownOpen = dropdownOpen[item.label];

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleDropdown(item.label)}
            title={isCollapsed ? item.label : ""}
            className={`w-full flex items-center transition-all duration-200 rounded-xl text-sm font-medium
              ${isCollapsed
                ? "justify-center p-3 hover:bg-gray-100 group"
                : `px-3 py-2.5 ${isDropdownOpen
                    ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                  }`
              }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors
              ${isCollapsed ? "text-gray-500 group-hover:text-gray-700" : "mr-3 text-gray-500"}`}
            />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`} />
              </>
            )}
          </button>

          {!isCollapsed && isDropdownOpen && (
            <div className="ml-8 mt-1 space-y-1">
              {item.children.map((child) => {
                if (child.roles && !userHasAccess(child.roles)) return null;
                const childActive = location.pathname === child.path;
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={handleMobileClose}
                    className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 border-l-2
                      ${childActive
                        ? "bg-blue-100 text-blue-700 font-medium border-blue-500 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:border-gray-200"
                      }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={handleMobileClose}
        title={isCollapsed ? item.label : ""}
        className={`relative flex items-center transition-all duration-200 group rounded-xl text-sm font-medium mb-1
          ${isCollapsed
            ? `justify-center p-3 hover:bg-gray-100 ${isActive ? "bg-blue-100" : ""}`
            : `px-3 py-2.5 ${isActive
                ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`
          }`}
      >
        <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors
          ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}
          ${!isCollapsed ? "mr-3" : ""}`}
        />
        {!isCollapsed && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            {isActive && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
          </>
        )}
        {isActive && isCollapsed && (
          <div className="absolute right-0.5 w-1 h-7 bg-blue-500 rounded-full" />
        )}
      </Link>
    );
  };

  // Sidebar width: collapsed = w-[70px], expanded = w-[260px]
  const sidebarWidthClass = isCollapsed ? "w-[70px]" : "w-[260px]";

  const SidebarContent = () => (
    <div className={`h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col transition-all duration-300 ${sidebarWidthClass}`}>
      {/* Header */}
      <div className={`flex items-center border-b border-gray-200 bg-gray-50 flex-shrink-0 px-3 py-3 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {isIdeatex ? (
                <>
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-md flex-shrink-0">I</div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">Ideatex</h2>
                    <p className="text-xs text-gray-500 truncate">Event Portal</p>
                  </div>
                </>
              ) : isEndeavour ? (
                <>
                  <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-md flex-shrink-0">E</div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">Endeavour</h2>
                    <p className="text-xs text-gray-500 truncate">Admin Portal</p>
                  </div>
                </>
              ) : (
                <>
                  <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain rounded-lg shadow-md flex-shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">Recruitment</h2>
                    <p className="text-xs text-gray-500 truncate">Admin Portal</p>
                  </div>
                </>
              )}
            </div>
            <button onClick={toggleCollapse} title="Collapse sidebar" className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </>
        ) : (
          <button onClick={toggleCollapse} title="Expand sidebar" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {menuItems.map(renderMenuItem)}
      </nav>

      {/* User Profile */}
      {user && (
        <div className={`border-t border-gray-200 bg-gray-50 flex-shrink-0 ${isCollapsed ? "p-2" : "p-3"}`}>
          {!isCollapsed ? (
            <div
              onClick={handleProfileClick}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white">
                <span className="text-white font-semibold text-sm">{user.name?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <p className="text-xs text-gray-500 capitalize truncate">{user.role}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative">
                <div
                  onClick={handleProfileClick}
                  title={`${user.name} (${user.role})`}
                  className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-all duration-200 ring-2 ring-white"
                >
                  <span className="text-white font-semibold text-sm">{user.name?.charAt(0).toUpperCase() || "U"}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button — only shown on small screens */}
      <button
        onClick={() => setMobileOpen(true)}
        className="sm:hidden fixed top-3 left-3 z-[60] p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile Drawer */}
      <div className={`sm:hidden fixed inset-0 z-[50] transition-all duration-300 ${mobileOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${mobileOpen ? "opacity-50" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer panel */}
        <div className={`absolute top-0 left-0 h-full transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Close button inside drawer */}
          <div className="absolute top-3 right-3 z-10">
            <button onClick={() => setMobileOpen(false)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {/* Force expanded on mobile */}
          <div className="h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col w-[260px]">
            {/* Header — always expanded on mobile */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 flex-shrink-0 px-3 py-3">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {isIdeatex ? (
                  <>
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">I</div>
                    <div className="min-w-0"><h2 className="text-sm font-semibold text-gray-900 truncate">Ideatex</h2><p className="text-xs text-gray-500">Event Portal</p></div>
                  </>
                ) : isEndeavour ? (
                  <>
                    <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">E</div>
                    <div className="min-w-0"><h2 className="text-sm font-semibold text-gray-900 truncate">Endeavour</h2><p className="text-xs text-gray-500">Admin Portal</p></div>
                  </>
                ) : (
                  <>
                    <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain rounded-lg shadow-md flex-shrink-0" />
                    <div className="min-w-0"><h2 className="text-sm font-semibold text-gray-900 truncate">Recruitment</h2><p className="text-xs text-gray-500">Admin Portal</p></div>
                  </>
                )}
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {menuItems.map(renderMenuItem)}
            </nav>
            {user && (
              <div className="border-t border-gray-200 bg-gray-50 flex-shrink-0 p-3">
                <div onClick={handleProfileClick} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white">
                    <span className="text-white font-semibold text-sm">{user.name?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      <p className="text-xs text-gray-500 capitalize truncate">{user.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden sm:block fixed top-0 left-0 h-screen z-50">
        <SidebarContent />
      </div>
    </>
  );
}