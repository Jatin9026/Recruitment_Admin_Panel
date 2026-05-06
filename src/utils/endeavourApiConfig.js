const RAW_BASE_URL = import.meta.env.VITE_ENDEAVOUR_API_BASE_URL || "https://endeavour-api.e-cell.in/api/v1";
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const TOKEN_KEY = "endeavourAccessToken";

const getAuthHeaders = ({ includeJsonContentType = true } = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    ...(includeJsonContentType ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getErrorMessage = async (response) => {
  const fallback = `HTTP ${response.status}: ${response.statusText}`;

  try {
    const errorData = await response.json();
    return errorData?.error || errorData?.message || errorData?.detail || fallback;
  } catch {
    return fallback;
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const ENDEAVOUR_API_ENDPOINTS = {
  ADMIN_LOGIN: "/admin/auth/login",
  AUTH_ME: "/auth/me",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ECELL_MEMBERS: "/ecell/ecell-members",
  REMOVE_ECELL_MEMBER: "/admin/ecell-members/remove",
  GRANT_ROLE: "/admin/roles/grant",
  REVOKE_ROLE: "/admin/roles/revoke",
  PARTICIPANTS_FULL: "/admin/participants/full",
  PARTICIPANT_FULL: "/admin/participants/{user_id}/full",
  TEAMS_FULL: "/admin/teams/full",
  TEAM_FULL: "/admin/teams/{team_id}/full",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_AUDIT_PING: "/admin/audit/ping",
  PENDING_VERIFICATION_ORDERS: "/admin/orders/pending-verification",
  VERIFY_ORDER: "/admin/orders/{order_id}/verify",
  CASH_COLLECT_ORDER: "/admin/orders/{order_id}/cash-collect",
  PAYMENT_ACCOUNTS: "/admin/payments/accounts",
  RESET_PAYMENT_QRS: "/admin/payments/reset-qrs",
  EVENTS: "/events",
  EVENT_DETAILS: "/events/{event_id}",
  EVENT_COORDINATORS: "/events/{event_id}/rounds/{round_id}/panels/{panel_id}/coordinators",
  EVENT_PROMOTIONS: "/events/{event_id}/rounds/{round_id}/promotions",
  EVENT_SLOTS: "/events/{event_id}/rounds/{round_id}/slots",
  EVENT_SLOTS_ASSIGN_RANDOM: "/events/{event_id}/rounds/{round_id}/slots/assign-random",
  DOMAINS: "/domains",
  PAST_EVENTS: "/past-events",
  SPEAKERS: "/speakers",
  SPONSORS: "/sponsors",
  MEDIA_UPLOAD: "/media/upload",
};

const buildQueryParams = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    queryParams.set(key, String(value));
  });

  return queryParams.toString();
};

const interpolatePath = (template, replacements = {}) => {
  return Object.entries(replacements).reduce((path, [token, value]) => {
    return path.replace(`{${token}}`, value);
  }, template);
};

export class EndeavourApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const includeJsonContentType = options.includeJsonContentType !== false;
    const config = {
      ...options,
      headers: {
        ...getAuthHeaders({ includeJsonContentType }),
        ...options.headers,
      },
    };

    delete config.includeJsonContentType;

    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem("endeavourAccessToken");
      localStorage.removeItem("endeavourAdminUser");
      if (globalThis.endeavourLogoutCallback) {
        globalThis.endeavourLogoutCallback();
      }
      throw new Error("Session expired. Please log in again.");
    }

    return handleResponse(response);
  }

  async adminLogin(email, password) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.ADMIN_LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.AUTH_ME);
  }

  async getDashboardStats() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.ADMIN_DASHBOARD);
  }

  async getEcellMembers() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.ECELL_MEMBERS);
  }

  async removeEcellMember(targetEmail) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.REMOVE_ECELL_MEMBER, {
      method: "POST",
      body: JSON.stringify({ target_email: targetEmail }),
    });
  }

  async grantRole(targetEmail, role) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.GRANT_ROLE, {
      method: "POST",
      body: JSON.stringify({ target_email: targetEmail, role }),
    });
  }

  async revokeRole(targetEmail, role) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.REVOKE_ROLE, {
      method: "POST",
      body: JSON.stringify({ target_email: targetEmail, role }),
    });
  }

  async getParticipantsFull({ page = 1, pageSize = 25, includeInactive = false, include = "" } = {}) {
    const query = buildQueryParams({
      page: String(page),
      page_size: String(pageSize),
      include_inactive: String(includeInactive),
      ...(include ? { include } : {}),
    });

    return this.request(`${ENDEAVOUR_API_ENDPOINTS.PARTICIPANTS_FULL}?${query}`);
  }

  async getParticipantFull(userId, include = "") {
    const query = buildQueryParams(include ? { include } : {});
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.PARTICIPANT_FULL, { user_id: userId });
    return this.request(query ? `${endpoint}?${query}` : endpoint);
  }

  async getTeamsFull({ page = 1, pageSize = 25, include = "" } = {}) {
    const query = buildQueryParams({
      page: String(page),
      page_size: String(pageSize),
      ...(include ? { include } : {}),
    });

    return this.request(`${ENDEAVOUR_API_ENDPOINTS.TEAMS_FULL}?${query}`);
  }

  async getTeamFull(teamId, include = "") {
    const query = buildQueryParams(include ? { include } : {});
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.TEAM_FULL, { team_id: teamId });
    return this.request(query ? `${endpoint}?${query}` : endpoint);
  }

  async getSettings() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.ADMIN_SETTINGS);
  }

  async upsertSettings(settings = []) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.ADMIN_SETTINGS, {
      method: "PUT",
      body: JSON.stringify({ settings }),
    });
  }

  async pingAudit() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.ADMIN_AUDIT_PING, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

    async getPendingVerificationOrders(params = {}) {
    const query = buildQueryParams(params);
    const endpoint = ENDEAVOUR_API_ENDPOINTS.PENDING_VERIFICATION_ORDERS;
    return this.request(query ? `${endpoint}?${query}` : endpoint);
  }

  async verifyOrder(orderId, action = "approve") {
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.VERIFY_ORDER, { order_id: orderId });
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  }

  async collectCashOrder(orderId) {
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.CASH_COLLECT_ORDER, { order_id: orderId });
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async getPaymentAccounts() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.PAYMENT_ACCOUNTS);
  }

  async resetPaymentQrUsage() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.RESET_PAYMENT_QRS, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async getEvents(status) {
    const query = buildQueryParams({ status });
    return this.request(query ? `${ENDEAVOUR_API_ENDPOINTS.EVENTS}?${query}` : ENDEAVOUR_API_ENDPOINTS.EVENTS);
  }

  async getEventById(eventId) {
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.EVENT_DETAILS, { event_id: eventId });
    return this.request(endpoint);
  }

  async createEvent(payload) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.EVENTS, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateEvent(eventId, payload) {
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.EVENT_DETAILS, { event_id: eventId });
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async assignPanelCoordinator(eventId, roundId, panelId, payload) {
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.EVENT_COORDINATORS, {
      event_id: eventId,
      round_id: roundId,
      panel_id: panelId,
    });

    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async promoteRoundByEmails(eventId, roundId, payload) {
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.EVENT_PROMOTIONS, {
      event_id: eventId,
      round_id: roundId,
    });

    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async createOfflineSlots(eventId, roundId, payload) {
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.EVENT_SLOTS, {
      event_id: eventId,
      round_id: roundId,
    });

    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async assignRandomSlots(eventId, roundId, payload = {}) {
    const endpoint = interpolatePath(ENDEAVOUR_API_ENDPOINTS.EVENT_SLOTS_ASSIGN_RANDOM, {
      event_id: eventId,
      round_id: roundId,
    });

    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getDomains() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.DOMAINS);
  }

  async createDomain(payload) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.DOMAINS, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getPastEvents() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.PAST_EVENTS);
  }

  async createPastEvent(payload) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.PAST_EVENTS, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getSpeakers() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.SPEAKERS);
  }

  async createSpeaker(payload) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.SPEAKERS, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getSponsors() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.SPONSORS);
  }

  async createSponsor(payload) {
    return this.request(ENDEAVOUR_API_ENDPOINTS.SPONSORS, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async uploadMedia({ file, folder, tags = [] }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    if (Array.isArray(tags)) {
      tags.filter(Boolean).forEach((tag) => {
        formData.append("tags", tag);
      });
    }

    return this.request(ENDEAVOUR_API_ENDPOINTS.MEDIA_UPLOAD, {
      method: "POST",
      body: formData,
      includeJsonContentType: false,
    });
  }
}

export const endeavourApiClient = new EndeavourApiClient();

export default endeavourApiClient;
