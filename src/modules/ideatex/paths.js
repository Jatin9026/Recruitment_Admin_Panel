export const IDEATEX_ROOT = "/ideatex";
export const IDEATEX_LOGIN = `${IDEATEX_ROOT}/login`;

export const IDEATEX_CHILD_PATHS = {
  dashboard: "dashboard",
  teams: "teams",
  coordinators: "coordinators",
  panelAssignment: "panel-assignment",
  settings: "settings",
};

export const IDEATEX_PATHS = {
  root: IDEATEX_ROOT,
  login: IDEATEX_LOGIN,
  dashboard: `${IDEATEX_ROOT}/${IDEATEX_CHILD_PATHS.dashboard}`,
  teams: `${IDEATEX_ROOT}/${IDEATEX_CHILD_PATHS.teams}`,
  coordinators: `${IDEATEX_ROOT}/${IDEATEX_CHILD_PATHS.coordinators}`,
  panelAssignment: `${IDEATEX_ROOT}/${IDEATEX_CHILD_PATHS.panelAssignment}`,
  settings: `${IDEATEX_ROOT}/${IDEATEX_CHILD_PATHS.settings}`,
};
