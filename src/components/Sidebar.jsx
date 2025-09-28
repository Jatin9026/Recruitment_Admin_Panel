import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import { ROLES, ROUTE_PERMISSIONS } from "../utils/rolePermissions";
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
  ChevronRight,
  UserPlus,
  UserCheck,
  Activity,
} from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, roles: ROUTE_PERMISSIONS.dashboard },
  { path: "/slots/bulk-assign", label: "Bulk Slot Assignment", icon: Clock, roles: ROUTE_PERMISSIONS.slots },
  { path: "/slots/attendance", label: "Slot Attendance", icon: UserCheck, roles: ROUTE_PERMISSIONS.slots },
  { path: "/groups/list", label: "Group Discussion", icon: UsersRound, roles: ROUTE_PERMISSIONS.groups },
  { path: "/screening", label: "Screening", icon: FileText, roles: ROUTE_PERMISSIONS.screening },
  {
    label: "Interviews",
    icon: CheckCircle,
    roles: ROUTE_PERMISSIONS.interviews,
    children: [
      { path: "/interview/tech", label: "Technical" },
      { path: "/interview/graphics", label: "Graphics" },
      { path: "/interview/pr", label: "Public Relations" },
      { path: "/interview/cr", label: "Corporate Relations" },
      { path: "/interview/events", label: "Events" },
    ],
  },
  { path: "/mail/bulk", label: "Bulk Mail", icon: Inbox, roles: ROUTE_PERMISSIONS.bulkMail },
  { path: "/mail/templates", label: "Mail Templates", icon: Mail, roles: ROUTE_PERMISSIONS.mailTemplates },
  { path: "/admin/create", label: "Create Admin", icon: UserPlus, roles: ROUTE_PERMISSIONS.createAdmin },
  { path: "/admin/list", label: "Admin List", icon: Users, roles: ROUTE_PERMISSIONS.adminLogs },
  { path: "/admin/logs", label: "Admin Logs", icon: Activity, roles: ROUTE_PERMISSIONS.adminLogs },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [dropdownOpen, setDropdownOpen] = useState({});

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sidebarCollapsed',
      newValue: newCollapsed.toString()
    }));
  };

  const toggleDropdown = (label) => {
    // If sidebar is collapsed and we're clicking a dropdown, expand first
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem('sidebarCollapsed', 'false');
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'sidebarCollapsed',
        newValue: 'false'
      }));
      // Open the dropdown after expanding
      setTimeout(() => {
        setDropdownOpen((prev) => ({ ...prev, [label]: true }));
      }, 100);
    } else {
      setDropdownOpen((prev) => ({ ...prev, [label]: !prev[label] }));
    }
  };

  const handleMenuClick = () => {
    // Collapse sidebar when any menu item is clicked
    if (!isCollapsed) {
      setIsCollapsed(true);
      localStorage.setItem('sidebarCollapsed', 'true');
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'sidebarCollapsed',
        newValue: 'true'
      }));
    }
    // Close mobile sidebar if open
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
    handleMenuClick();
  };

  const userHasAccess = (roles) => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  const renderMenuItem = (item) => {
    if (!userHasAccess(item.roles)) return null;

    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = dropdownOpen[item.label];

    if (hasChildren) {
      return (
        <div key={item.label} className={isCollapsed ? "mb-3" : "mb-2"}>
          <button
            onClick={() => toggleDropdown(item.label)}
            className={`w-full flex items-center transition-all duration-200 ${
              isCollapsed 
                ? 'justify-center p-3 rounded-xl hover:bg-gray-100 group' 
                : `px-4 py-3 rounded-xl ${
                    isDropdownOpen 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
            } text-sm font-medium`}
            title={isCollapsed ? `${item.label} - Click to expand` : ''}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
              isCollapsed 
                ? 'text-gray-500 group-hover:text-gray-700' 
                : 'mr-3'
            }`} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </>
            )}
          </button>
          {!isCollapsed && isDropdownOpen && (
            <div className="ml-8 mt-2 space-y-1">
              {item.children.map((child) => {
                // Check if child has its own role restrictions
                const hasChildAccess = child.roles ? userHasAccess(child.roles) : true;
                if (!hasChildAccess) return null;
                
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={handleMenuClick}
                    className={`block px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      location.pathname === child.path
                        ? 'bg-blue-100 text-blue-700 font-medium shadow-sm border-l-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent hover:border-gray-200'
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
        onClick={handleMenuClick}
        className={`flex items-center transition-all duration-200 group ${
          isCollapsed 
            ? `justify-center p-3 mb-3 rounded-xl hover:bg-gray-100 ${
                isActive ? 'bg-blue-100 shadow-md' : ''
              }` 
            : `px-4 py-3 mb-2 rounded-xl ${
                isActive 
                  ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
              }`
        } text-sm font-medium`}
        title={isCollapsed ? item.label : ''}
      >
        <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${
          isCollapsed 
            ? `${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}` 
            : `mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`
        }`} />
        {!isCollapsed && <span>{item.label}</span>}
        {isActive && !isCollapsed && (
          <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
        {isActive && isCollapsed && (
          <div className="absolute right-1 w-1 h-8 bg-blue-500 rounded-full"></div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
      >
        {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg z-30 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        {/* Header */}
        <div className={`flex items-center justify-center p-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0 ${
          isCollapsed ? 'px-2 py-4' : ''
        }`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center space-x-3 flex-1">
              <img 
                // src="https://firebasestorage.googleapis.com/v0/b/endevaour-2023.appspot.com/o/webassets%2Fwhite%20logo%20br.png?alt=media&token=50662b36-d955-4f24-985c-bd73a9101e01" 
                src="/logo.png"
                alt="Recruitment Logo"
                className="w-10 h-10 object-contain rounded-lg shadow-md"
              />

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recruitment</h2>
                  <p className="text-xs text-gray-500">Admin Portal</p>
                </div>
              </div>
              <button
                onClick={toggleCollapse}
                className="flex items-center justify-center p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 w-full">
              {/* <div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
                title="Recruitment Admin Portal - Click to expand"
                onClick={() => setIsCollapsed(false)}
              >
                <span className="text-white font-bold text-xl">R</span>
              </div> */}
              <button
                onClick={toggleCollapse}
                className="flex items-center justify-center p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
          isCollapsed ? 'px-2 py-4' : 'px-4 py-4'
        }`}>
          <div className={`space-y-1 ${isCollapsed ? 'space-y-2' : ''}`}>
            {menuItems.map(renderMenuItem)}
          </div>
        </nav>

        
        {/* User Profile */}
        {user && (
          <div className={`border-b border-gray-200 bg-gray-50 flex-shrink-0 ${
            isCollapsed ? 'p-2' : 'p-4'
          }`}>
            {!isCollapsed ? (
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors" onClick={handleProfileClick}>
                <div 
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white"
                  title={`${user.name} (${user.role}) - Click to view profile`}
                >
                  <span className="text-white font-semibold text-lg">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 ring-2 ring-white"
                    title={`${user.name} (${user.role}) - Click to view profile`}
                    onClick={handleProfileClick}
                  >
                    <span className="text-white font-semibold text-lg">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}
