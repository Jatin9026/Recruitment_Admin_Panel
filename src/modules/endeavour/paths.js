export const ENDEAVOUR_ROOT = "/endeavour";
export const ENDEAVOUR_LOGIN = `${ENDEAVOUR_ROOT}/login`;

export const ENDEAVOUR_CHILD_PATHS = {
  dashboard: "dashboard",
  ecellMembers: "ecell-members",
  roles: "roles",
  participants: "participants",
  teams: "teams",
  settings: "settings",
  auditTools: "audit-tools",
  paymentsVerification: "payments/verification",
  paymentsAccounts: "payments/accounts",
  events: "events",
  eventOperations: "events/:eventId/operations",
  contentDomains: "content/domains",
  contentPastEvents: "content/past-events",
  contentSpeakers: "content/speakers",
  contentSponsors: "content/sponsors",
  contentMedia: "content/media",
};

export const ENDEAVOUR_PATHS = {
  root: ENDEAVOUR_ROOT,
  login: ENDEAVOUR_LOGIN,
  dashboard: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.dashboard}`,
  ecellMembers: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.ecellMembers}`,
  roles: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.roles}`,
  participants: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.participants}`,
  teams: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.teams}`,
  settings: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.settings}`,
  auditTools: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.auditTools}`,
  paymentsVerification: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.paymentsVerification}`,
  paymentsAccounts: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.paymentsAccounts}`,
  events: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.events}`,
  eventOperations: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.eventOperations}`,
  contentDomains: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.contentDomains}`,
  contentPastEvents: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.contentPastEvents}`,
  contentSpeakers: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.contentSpeakers}`,
  contentSponsors: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.contentSponsors}`,
  contentMedia: `${ENDEAVOUR_ROOT}/${ENDEAVOUR_CHILD_PATHS.contentMedia}`,
};

export const getEndeavourEventOperationsPath = (eventId) =>
  `${ENDEAVOUR_PATHS.events}/${eventId}/operations`;
