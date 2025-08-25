// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  const { name, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-14">
          {/* Logo / Title */}
          <Link
            to="/dashboard"
            className="font-semibold text-lg text-gray-800 hover:text-black transition"
          >
            Admin Panel
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {name || "Guest"}
            </span>
            <button
              onClick={logout}
              className="bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-md text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Body: Sidebar + Main Content */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-white p-8 rounded-tl-2xl shadow-inner">
          {children}
        </main>
      </div>
    </div>
  );
}
