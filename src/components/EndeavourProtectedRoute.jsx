import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useEndeavourAuthStore } from "../store/endeavourAuthStore";
import { ENDEAVOUR_PATHS } from "../modules/endeavour/paths";

export default function EndeavourProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized } = useEndeavourAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ENDEAVOUR_PATHS.login} state={{ from: location }} replace />;
  }

  return children;
}
