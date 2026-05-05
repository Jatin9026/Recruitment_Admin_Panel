import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useIdeatexAuthStore } from '../store/ideatexAuthStore';
import { useEndeavourAuthStore } from '../store/endeavourAuthStore';
import Sidebar from './Sidebar';
import { RECRUITMENT_PATHS } from '../modules/recruitment/paths';
import { IDEATEX_PATHS } from '../modules/ideatex/paths';
import { ENDEAVOUR_PATHS } from '../modules/endeavour/paths';

function Layout({ moduleType = 'recruitment' }) {
  const { user: recruitmentUser, logout: recruitmentLogout } = useAuthStore();
  const { user: ideatexUser, logout: ideatexLogout } = useIdeatexAuthStore();
  const { user: endeavourUser, logout: endeavourLogout } = useEndeavourAuthStore();

  const isIdeatex = moduleType === 'ideatex';
  const isEndeavour = moduleType === 'endeavour';

  const user = isIdeatex ? ideatexUser : isEndeavour ? endeavourUser : recruitmentUser;
  const logout = isIdeatex ? ideatexLogout : isEndeavour ? endeavourLogout : recruitmentLogout;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sidebarCollapsed') {
        setSidebarCollapsed(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    logout();
    if (isEndeavour) return navigate(ENDEAVOUR_PATHS.login);
    if (isIdeatex) return navigate(IDEATEX_PATHS.login);
    navigate(RECRUITMENT_PATHS.login);
  };

  const handleProfileClick = () => {
    if (isEndeavour) return navigate(ENDEAVOUR_PATHS.dashboard);
    if (isIdeatex) return navigate(IDEATEX_PATHS.settings);
    navigate(RECRUITMENT_PATHS.adminProfile);
  };

  // On mobile (< sm): no left margin (sidebar is a drawer overlay)
  // On desktop: margin matches sidebar width — 70px collapsed, 260px expanded
  const mainClass = sidebarCollapsed
    ? 'sm:ml-[70px]'
    : 'sm:ml-[260px]';

  return (
    <div className="min-h-screen font-caldina bg-gray-50">
      <Sidebar moduleType={moduleType} />

      {/* Main content shifts right on desktop only */}
      <main className={`min-h-screen transition-all duration-300 ease-in-out ${mainClass}`}>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">

              {/* Brand — offset on mobile to clear the hamburger button (fixed at left-3) */}
              <div className="flex items-center space-x-2 sm:space-x-3 pl-10 sm:pl-0">
                {isIdeatex ? (
                  <>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-base sm:text-xl shadow-md flex-shrink-0">
                      I
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Ideatex Event</h1>
                      <p className="hidden sm:block text-xs text-gray-500">Admin Management System</p>
                    </div>
                  </>
                ) : isEndeavour ? (
                  <>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white text-base sm:text-xl shadow-md flex-shrink-0">
                      E
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Endeavour Portal</h1>
                      <p className="hidden sm:block text-xs text-gray-500">Admin Management System</p>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src="/logo.png"
                      alt="Recruitment Logo"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg shadow-md flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Recruitment Portal</h1>
                      <p className="hidden sm:block text-xs text-gray-500">Admin Management System</p>
                    </div>
                  </>
                )}
              </div>

              {/* Right: User info + Logout */}
              {user && (
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {/* Desktop user card */}
                  <div
                    onClick={handleProfileClick}
                    className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-lg cursor-pointer px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[140px] lg:max-w-[200px]">
                        {user?.name || 'Admin'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{user?.role || 'Admin'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile avatar only */}
                  <div
                    onClick={handleProfileClick}
                    className="sm:hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
                  >
                    <span className="text-white font-semibold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;