import React from "react";
import { Navigate } from "react-router-dom";
import EndeavourDashboard from "../../pages/endeavour/dashboard/Dashboard";
import EcellMembers from "../../pages/endeavour/ecell-members/EcellMembers";
import RolesAndAccess from "../../pages/endeavour/roles/RolesAndAccess";
import EndeavourParticipants from "../../pages/endeavour/participants/Participants";
import EndeavourTeams from "../../pages/endeavour/teams/Teams";
import RuntimeSettings from "../../pages/endeavour/settings/RuntimeSettings";
import AuditTools from "../../pages/endeavour/audit/AuditTools";
import EventOperations from "../../pages/endeavour/events/EventOperations";
import { ENDEAVOUR_CHILD_PATHS, ENDEAVOUR_PATHS } from "./paths";
import EndeavourProtectedRoute from "../../components/EndeavourProtectedRoute";
import { ENDEAVOUR_ALLOWED_ROLES } from "../../utils/endeavourRoleAccess";

export const endeavourRoutes = [
  {
    index: true,
    element: <Navigate to={ENDEAVOUR_PATHS.dashboard} replace />,
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.dashboard,
    element: (
      <EndeavourProtectedRoute allowedRoles={ENDEAVOUR_ALLOWED_ROLES.anyAdminSide}>
        <EndeavourDashboard />
      </EndeavourProtectedRoute>
    ),
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.ecellMembers,
    element: (
      <EndeavourProtectedRoute allowedRoles={ENDEAVOUR_ALLOWED_ROLES.adminPlus}>
        <EcellMembers />
      </EndeavourProtectedRoute>
    ),
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.roles,
    element: (
      <EndeavourProtectedRoute allowedRoles={ENDEAVOUR_ALLOWED_ROLES.adminPlus}>
        <RolesAndAccess />
      </EndeavourProtectedRoute>
    ),
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.participants,
    element: (
      <EndeavourProtectedRoute allowedRoles={ENDEAVOUR_ALLOWED_ROLES.adminPlus}>
        <EndeavourParticipants />
      </EndeavourProtectedRoute>
    ),
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.teams,
    element: (
      <EndeavourProtectedRoute allowedRoles={ENDEAVOUR_ALLOWED_ROLES.adminPlus}>
        <EndeavourTeams />
      </EndeavourProtectedRoute>
    ),
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.settings,
    element: (
      <EndeavourProtectedRoute allowedRoles={ENDEAVOUR_ALLOWED_ROLES.adminPlus}>
        <RuntimeSettings />
      </EndeavourProtectedRoute>
    ),
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.auditTools,
    element: (
      <EndeavourProtectedRoute allowedRoles={ENDEAVOUR_ALLOWED_ROLES.superadminOnly}>
        <AuditTools />
      </EndeavourProtectedRoute>
    ),
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.events,
    element: (
      <EndeavourProtectedRoute allowedRoles={ENDEAVOUR_ALLOWED_ROLES.eventManagerPlus}>
        <EventOperations />
      </EndeavourProtectedRoute>
    ),
  },
];
