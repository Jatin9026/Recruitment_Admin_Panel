import React from "react";
import { Navigate } from "react-router-dom";
import EndeavourDashboard from "../../pages/endeavour/dashboard/Dashboard";
import EndeavourUsers from "../../pages/endeavour/users/Users";
import EndeavourParticipants from "../../pages/endeavour/participants/Participants";
import EndeavourTeams from "../../pages/endeavour/teams/Teams";
import { ENDEAVOUR_CHILD_PATHS, ENDEAVOUR_PATHS } from "./paths";

export const endeavourRoutes = [
  {
    index: true,
    element: <Navigate to={ENDEAVOUR_PATHS.dashboard} replace />,
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.dashboard,
    element: <EndeavourDashboard />,
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.users,
    element: <EndeavourUsers />,
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.participants,
    element: <EndeavourParticipants />,
  },
  {
    path: ENDEAVOUR_CHILD_PATHS.teams,
    element: <EndeavourTeams />,
  },
];
