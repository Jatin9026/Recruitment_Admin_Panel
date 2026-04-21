import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useEndeavourAuthStore } from "../store/endeavourAuthStore";
import { ENDEAVOUR_PATHS } from "../modules/endeavour/paths";
import { hasAnyEndeavourRoleAccess } from "../utils/endeavourRoleAccess";

export default function EndeavourProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, isInitialized, user } = useEndeavourAuthStore();
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

  if (!hasAnyEndeavourRoleAccess(user?.role, allowedRoles)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Your Role:</span> {user?.role || "unknown"}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Required Roles:</span> {allowedRoles.join(", ") || "authenticated"}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
