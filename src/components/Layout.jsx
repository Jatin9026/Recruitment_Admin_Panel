
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Sidebar from "./Sidebar";

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 fixed w-full z-30">
        <div className="max-w-7xl mx-auto px-16 flex justify-between items-center h-14">
          <h1 className="font-semibold text-lg text-gray-800">
             Admin Panel
          </h1>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1 pt-14">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-white p-4 md:p-8 rounded-tl-2xl shadow-inner overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}