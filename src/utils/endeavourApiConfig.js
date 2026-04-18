const RAW_BASE_URL = import.meta.env.VITE_ENDEAVOUR_API_BASE_URL || "https://endeavour-backend.onrender.com/api/v1";
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const TOKEN_KEY = "endeavourAccessToken";

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
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
  ADMIN_USERS: "/admin/users",
  PARTICIPANTS_FULL: "/admin/participants/full",
  PARTICIPANT_FULL: "/admin/participants/{user_id}/full",
  TEAMS_FULL: "/admin/teams/full",
  TEAM_FULL: "/admin/teams/{team_id}/full",
};

export class EndeavourApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    };

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

  async getUsers() {
    return this.request(ENDEAVOUR_API_ENDPOINTS.ADMIN_USERS);
  }

  async getParticipantsFull({ page = 1, pageSize = 25, includeInactive = false, include = "" } = {}) {
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      include_inactive: String(includeInactive),
      ...(include ? { include } : {}),
    });

    return this.request(`${ENDEAVOUR_API_ENDPOINTS.PARTICIPANTS_FULL}?${queryParams.toString()}`);
  }

  async getParticipantFull(userId, include = "") {
    const queryParams = new URLSearchParams(include ? { include } : {});
    const endpoint = ENDEAVOUR_API_ENDPOINTS.PARTICIPANT_FULL.replace("{user_id}", userId);
    return this.request(queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint);
  }

  async getTeamsFull({ page = 1, pageSize = 25, include = "" } = {}) {
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...(include ? { include } : {}),
    });

    return this.request(`${ENDEAVOUR_API_ENDPOINTS.TEAMS_FULL}?${queryParams.toString()}`);
  }

  async getTeamFull(teamId, include = "") {
    const queryParams = new URLSearchParams(include ? { include } : {});
    const endpoint = ENDEAVOUR_API_ENDPOINTS.TEAM_FULL.replace("{team_id}", teamId);
    return this.request(queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint);
  }
}

export const endeavourApiClient = new EndeavourApiClient();

export default endeavourApiClient;
