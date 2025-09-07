import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import Sidebar from './Sidebar'; 

function Layout() {
  const { user, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for sidebar collapse changes (you'll need to implement this communication)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sidebarCollapsed') {
        setSidebarCollapsed(e.newValue === 'true');
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Check initial state
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setSidebarCollapsed(collapsed);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    logout();
    console.log("User logged out from Layout");
  };

  const getMainContentMargin = () => {
    if (isMobile) return 0;
    return sidebarCollapsed ? 80 : 280;
  };

  return (
    <div className="min-h-screen font-caldina bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <motion.main
        animate={{
          marginLeft: getMainContentMargin(),
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="min-h-screen"
      >
        {/* Simple Professional Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 lg:px-8">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center space-x-4">
                {/* Logo/Brand */}
                <img 
  src="https://firebasestorage.googleapis.com/v0/b/endevaour-2023.appspot.com/o/webassets%2Fwhite%20logo%20br.png?alt=media&token=50662b36-d955-4f24-985c-bd73a9101e01" 
  alt="Recruitment Logo"
  className="w-10 h-10 object-contain rounded-lg shadow-md"
/>

                
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Recruitment Portal
                  </h1>
                  <p className="text-sm text-gray-500">
                    Admin Management System
                  </p>
                </div>
              </div>
              
              {/* User Info & Actions */}
              <div className="flex items-center space-x-4">
                {user && (
                  <>
                    {/* Notifications */}
                    {/* <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m5-1a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    </button> */}

                    {/* User Profile */}
                    <div className="hidden sm:flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full" />
                          {user.role}
                        </div>
                      </div>
                    </div>

                    {/* Mobile User Avatar */}
                    <div className="sm:hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>

                    {/* Settings */}
                    {/* <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button> */}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-8">
          <div className="max-w-full">
            <Outlet />
          </div>
        </div>
      </motion.main>
    </div>
  );
}

export default Layout;
