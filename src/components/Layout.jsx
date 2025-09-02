import React from 'react';
import { Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Sidebar from './Sidebar'; 

function Layout() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    console.log("User logged out from Layout");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{user.name}</span>
                    <span className="block text-xs text-gray-500">
                      {user.email} | {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-0 md:ml-64 pt-14">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
