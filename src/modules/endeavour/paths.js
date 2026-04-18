export const ENDEAVOUR_ROOT = "/endeavour";
export const ENDEAVOUR_LOGIN = `${ENDEAVOUR_ROOT}/login`;

export const ENDEAVOUR_CHILD_PATHS = {
  dashboard: "dashboard",
  users: "users",
  participants: "participants",
  teams: "teams",
};

export const ENDEAVOUR_PATHS = {
  root: ENDEAVOUR_ROOT,
  login: ENDEAVOUR_LOGIN,
  dashboard: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.dashboard}`,
  users: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.users}`,
  participants: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.participants}`,
  teams: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.teams}`,
};
