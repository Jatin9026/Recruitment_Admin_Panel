// Ideatex API Configuration
// const API_BASE_URL = 'https://ideatex-backend.onrender.com/api/v1';
// Ideatex API Configuration
// Use proxy in development, full URL in production
const API_BASE_URL = "https://ideatex.shdevsolutions.com/api/v1";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('ideatexAccessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Ideatex API endpoints
export const IDEATEX_API_ENDPOINTS = {
  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_REGISTER: '/admin/register',
  ADMIN_PROFILE: '/admin/profile',
  
  // Users/Teams
  GET_ALL_USERS: '/users',
  GET_ALL_TEAMS: '/admin/teams',
  
  // Teams
  ASSIGN_PANEL: '/teams/{id}/panel',
  BULK_ASSIGN_PANELS: '/teams/panels',
  ASSIGN_SLOT: '/teams/{id}/slot',
  BULK_ASSIGN_SLOTS: '/teams/slots',
  
  // Coordinators
  CREATE_COORDINATOR: '/coordinators',
  GET_COORDINATORS: '/coordinators',
  UPDATE_COORDINATOR_PANEL: '/coordinators/{id}/panel',
  DELETE_COORDINATOR: '/coordinators/{id}',
  
  // Settings
  GET_ALL_SETTINGS: '/settings',
  CREATE_SETTING: '/settings',
  GET_SETTING_BY_CATEGORY: '/settings/category/{category}',
  GET_SETTING_BY_KEY: '/settings/{key}',
  UPDATE_SETTING: '/settings/{key}',
  DELETE_SETTING: '/settings/{key}',
  RELOAD_SETTINGS: '/settings/reload',
  
  // Certificate
  GET_CERTIFICATE_STATUS: '/admin/certificate/status',
  TOGGLE_CERTIFICATE: '/admin/certificate/toggle',
};

// Ideatex API client class
export class IdeatexApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include', 
      headers: getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Check if the response is 401 (Unauthorized)
      if (response.status === 401) {
        console.error('Ideatex session expired');
        
        // Clear tokens and redirect to login
        localStorage.removeItem('ideatexAccessToken');
        localStorage.removeItem('ideatexRefreshToken');
        localStorage.removeItem('ideatexAdminUser');
        
        // Trigger logout if callback is available
        if (window.ideatexLogoutCallback) {
          window.ideatexLogoutCallback();
        }
        
        throw new Error('Session expired. Please log in again.');
      }
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`Ideatex API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Admin operations
  async adminLogin(email, password) {
    return this.request(IDEATEX_API_ENDPOINTS.ADMIN_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async adminRegister(adminData) {
    return this.request(IDEATEX_API_ENDPOINTS.ADMIN_REGISTER, {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
  }

  async getAdminProfile() {
    return this.request(IDEATEX_API_ENDPOINTS.ADMIN_PROFILE);
  }

  async updateProfile(profileData) {
    return this.request(IDEATEX_API_ENDPOINTS.ADMIN_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // User/Team operations
  async getAllUsers() {
    return this.request(IDEATEX_API_ENDPOINTS.GET_ALL_USERS);
  }

  async getAllTeams() {
    return this.request(IDEATEX_API_ENDPOINTS.GET_ALL_TEAMS);
  }

  // Team panel/slot assignment
  async assignPanel(teamId, panel) {
    return this.request(IDEATEX_API_ENDPOINTS.ASSIGN_PANEL.replace('{id}', teamId), {
      method: 'PUT',
      body: JSON.stringify({ panel })
    });
  }

  async bulkAssignPanels(assignments) {
    return this.request(IDEATEX_API_ENDPOINTS.BULK_ASSIGN_PANELS, {
      method: 'PUT',
      body: JSON.stringify({ assignments })
    });
  }

  async assignSlot(teamId, slot) {
    return this.request(IDEATEX_API_ENDPOINTS.ASSIGN_SLOT.replace('{id}', teamId), {
      method: 'PUT',
      body: JSON.stringify({ slot })
    });
  }

  async bulkAssignSlots(assignments) {
    return this.request(IDEATEX_API_ENDPOINTS.BULK_ASSIGN_SLOTS, {
      method: 'PUT',
      body: JSON.stringify({ assignments })
    });
  }

  // Coordinator operations
  async createCoordinator(coordinatorData) {
    return this.request(IDEATEX_API_ENDPOINTS.CREATE_COORDINATOR, {
      method: 'POST',
      body: JSON.stringify(coordinatorData)
    });
  }

  async getCoordinators() {
    return this.request(IDEATEX_API_ENDPOINTS.GET_COORDINATORS);
  }

  async getAllCoordinators() {
    return this.request(IDEATEX_API_ENDPOINTS.GET_COORDINATORS);
  }

  async getCoordinatorById(coordinatorId) {
    return this.request(`${IDEATEX_API_ENDPOINTS.GET_COORDINATORS}/${coordinatorId}`);
  }

  async updateCoordinator(coordinatorId, coordinatorData) {
    return this.request(`${IDEATEX_API_ENDPOINTS.GET_COORDINATORS}/${coordinatorId}`, {
      method: 'PUT',
      body: JSON.stringify(coordinatorData)
    });
  }

  async updateCoordinatorPanel(coordinatorId, panel) {
    return this.request(IDEATEX_API_ENDPOINTS.UPDATE_COORDINATOR_PANEL.replace('{id}', coordinatorId), {
      method: 'PATCH',
      body: JSON.stringify({ panel })
    });
  }

  async deleteCoordinator(coordinatorId) {
    return this.request(IDEATEX_API_ENDPOINTS.DELETE_COORDINATOR.replace('{id}', coordinatorId), {
      method: 'DELETE'
    });
  }

  // Settings operations
  async getAllSettings() {
    return this.request(IDEATEX_API_ENDPOINTS.GET_ALL_SETTINGS);
  }

  async createSetting(settingData) {
    return this.request(IDEATEX_API_ENDPOINTS.CREATE_SETTING, {
      method: 'POST',
      body: JSON.stringify(settingData)
    });
  }

  async getSettingsByCategory(category) {
    return this.request(IDEATEX_API_ENDPOINTS.GET_SETTING_BY_CATEGORY.replace('{category}', category));
  }

  async getSetting(key) {
    return this.request(IDEATEX_API_ENDPOINTS.GET_SETTING_BY_KEY.replace('{key}', key));
  }

  async updateSetting(key, settingData) {
    return this.request(IDEATEX_API_ENDPOINTS.UPDATE_SETTING.replace('{key}', key), {
      method: 'PUT',
      body: JSON.stringify(settingData)
    });
  }

  async deleteSetting(key) {
    return this.request(IDEATEX_API_ENDPOINTS.DELETE_SETTING.replace('{key}', key), {
      method: 'DELETE'
    });
  }

  async reloadSettings() {
    return this.request(IDEATEX_API_ENDPOINTS.RELOAD_SETTINGS, {
      method: 'POST'
    });
  }

  // Certificate operations
  async getCertificateStatus() {
    return this.request(IDEATEX_API_ENDPOINTS.GET_CERTIFICATE_STATUS);
  }

  async toggleCertificateStatus(published) {
    return this.request(IDEATEX_API_ENDPOINTS.TOGGLE_CERTIFICATE, {
      method: 'POST',
      body: JSON.stringify({ published })
    });
  }
}

// Export a default instance
export const ideatexApiClient = new IdeatexApiClient();

export default ideatexApiClient;
