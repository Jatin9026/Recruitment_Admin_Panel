import React from "react";
import { Navigate } from "react-router-dom";
import { RECRUITMENT_PATHS } from "../modules/recruitment/paths";
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token"); 
  if (!isAuthenticated) {
    return <Navigate to={RECRUITMENT_PATHS.login} replace />
  }
  return children; 
};
export default ProtectedRoute;
