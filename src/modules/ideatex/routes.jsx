import React from "react";
import { Navigate } from "react-router-dom";
import IdeatexDashboard from "../../pages/ideatex/Dashboard";
import TeamList from "../../pages/ideatex/TeamList";
import CoordinatorList from "../../pages/ideatex/CoordinatorList";
import PanelAssignment from "../../pages/ideatex/PanelAssignment";
import IdeatexSettings from "../../pages/ideatex/Settings";
import { IDEATEX_CHILD_PATHS, IDEATEX_PATHS } from "./paths";

export const ideatexRoutes = [
  {
    index: true,
    element: <Navigate to={IDEATEX_PATHS.dashboard} replace />,
  },
  {
    path: IDEATEX_CHILD_PATHS.dashboard,
    element: <IdeatexDashboard />,
  },
  {
    path: IDEATEX_CHILD_PATHS.teams,
    element: <TeamList />,
  },
  {
    path: IDEATEX_CHILD_PATHS.coordinators,
    element: <CoordinatorList />,
  },
  {
    path: IDEATEX_CHILD_PATHS.panelAssignment,
    element: <PanelAssignment />,
  },
  {
    path: IDEATEX_CHILD_PATHS.settings,
    element: <IdeatexSettings />,
  },
];
