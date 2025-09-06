// API Configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rec-backend-z2qa.onrender.com';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
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

// API endpoints
export const API_ENDPOINTS = {
  // Users
  USERS_GET: '/api/users/get',
  USERS_CREATE: '/api/users/',
  USERS_BY_EMAIL: '/api/users/{email}',
  USERS_BY_GROUP: '/api/users/group/{group_number}',
  
  // Bulk operations
  BULK_CREATE_ROUNDS: '/api/users/bulk/create-rounds',
  BULK_UPDATE_ROUNDS: '/api/users/bulk/update-rounds',
  BULK_MARK_ABSENT: '/api/users/bulk/mark-absent',
  BULK_CHANGE_GROUP: '/api/users/bulk/change-group',
  
  // Screening
  UPDATE_SCREENING: '/api/users/{email}/screening',
  UPDATE_GD: '/api/users/{email}/gd',
  UPDATE_PI: '/api/users/{email}/pi',
  
  // Tasks
  UPDATE_TASK: '/api/users/{email}/task',
  UPDATE_TASK_STATUS: '/api/users/{email}/task-status',
  SHORTLIST_USERS: '/api/users/shortlist',
  
  // Groups
  GROUP_STATISTICS: '/api/users/groups/statistics',
  
  // Auth
  LOGIN: '/api/auth/login',
  VERIFY_OTP: '/api/auth/verify-otp',
  REFRESH_TOKEN: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  
  // Admin
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_CREATE: '/api/admin/create',
  ADMIN_ME: '/api/admin/me'
};

// API client class
export class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      return await handleResponse(response);
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // User operations
  async getUsers() {
    return this.request(API_ENDPOINTS.USERS_GET);
  }

  async createUser(userData) {
    return this.request(API_ENDPOINTS.USERS_CREATE, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getUserByEmail(email) {
    return this.request(API_ENDPOINTS.USERS_BY_EMAIL.replace('{email}', email));
  }

  async getUsersByGroup(groupNumber) {
    return this.request(API_ENDPOINTS.USERS_BY_GROUP.replace('{group_number}', groupNumber));
  }

  // Bulk operations
  async bulkCreateRounds(requestData) {
    return this.request(API_ENDPOINTS.BULK_CREATE_ROUNDS, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async bulkUpdateRounds(requestData) {
    return this.request(API_ENDPOINTS.BULK_UPDATE_ROUNDS, {
      method: 'PUT',
      body: JSON.stringify(requestData)
    });
  }

  async bulkMarkAbsent(emails) {
    return this.request(API_ENDPOINTS.BULK_MARK_ABSENT, {
      method: 'PUT',
      body: JSON.stringify({ emails })
    });
  }

  async bulkChangeGroup(emails, targetGroupNumber) {
    return this.request(API_ENDPOINTS.BULK_CHANGE_GROUP, {
      method: 'PUT',
      body: JSON.stringify({ emails, targetGroupNumber })
    });
  }

  // Screening operations
  async updateUserScreening(email, screeningData) {
    return this.request(API_ENDPOINTS.UPDATE_SCREENING.replace('{email}', email), {
      method: 'PUT',
      body: JSON.stringify(screeningData)
    });
  }

  async updateUserGD(email, gdData) {
    return this.request(API_ENDPOINTS.UPDATE_GD.replace('{email}', email), {
      method: 'PUT',
      body: JSON.stringify(gdData)
    });
  }

  async updateUserPI(email, piData) {
    return this.request(API_ENDPOINTS.UPDATE_PI.replace('{email}', email), {
      method: 'PUT',
      body: JSON.stringify(piData)
    });
  }

  // Task operations
  async updateUserTask(email, taskData) {
    return this.request(API_ENDPOINTS.UPDATE_TASK.replace('{email}', email), {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  }

  async updateTaskStatus(email, taskStatusData) {
    return this.request(API_ENDPOINTS.UPDATE_TASK_STATUS.replace('{email}', email), {
      method: 'PUT',
      body: JSON.stringify(taskStatusData)
    });
  }

  async shortlistUsers(emails) {
    return this.request(API_ENDPOINTS.SHORTLIST_USERS, {
      method: 'POST',
      body: JSON.stringify({ emails })
    });
  }

  // Group operations
  async getGroupStatistics() {
    return this.request(API_ENDPOINTS.GROUP_STATISTICS);
  }

  // Auth operations
  async login(email) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyOTP(email, otp) {
    return this.request(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  }

  async refreshToken(refreshToken) {
    return this.request(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  }

  async logout(refreshToken) {
    return this.request(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  }

  // Admin operations
  async adminLogin(email, password) {
    return this.request(API_ENDPOINTS.ADMIN_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async createAdmin(adminData) {
    return this.request(API_ENDPOINTS.ADMIN_CREATE, {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
  }

  async getAdminInfo() {
    return this.request(API_ENDPOINTS.ADMIN_ME);
  }
}

// Export a default instance
export const apiClient = new ApiClient();

export default apiClient;
