// API Configuration and utilities
const API_BASE_URL = 'https://rec-backend-z2qa.onrender.com';

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
  BULK_ASSIGN_SLOTS: '/api/users/bulk-assign-slots',
  
  // Screening
  UPDATE_SCREENING: '/api/users/{email}/screening',
  UPDATE_GD: '/api/users/{email}/gd',
  UPDATE_PI: '/api/users/{email}/pi',
  
  // Tasks
  UPDATE_TASK: '/api/users/{email}/task',
  UPDATE_TASK_STATUS: '/api/users/{email}/task-status',
  SHORTLIST_USERS: '/api/users/shortlist',
  
  // Attendance
  UPDATE_ATTENDANCE: '/api/users/{email}/attendance',
  
  // Groups
  GROUP_STATISTICS: '/api/users/groups/statistics',
  
  // Email
  SEND_EMAIL: '/api/emails/send',
  GET_EMAIL_TEMPLATES: '/api/emails/templates',
  SAVE_EMAIL_TEMPLATE: '/api/emails/templates',
  
  // Admin
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_CREATE: '/api/admin/create',
  ADMIN_ME: '/api/admin/me',
  ADMIN_UPDATE: '/api/admin/update',
  ADMIN_LOGS: '/api/logs/',
  
  // Settings
  SETTINGS_GET: '/api/settings/',
  SETTINGS_TOGGLE_RESULT: '/api/settings/toggle-result'
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

  async bulkAssignSlots(emails, assignedSlot) {
    return this.request(API_ENDPOINTS.BULK_ASSIGN_SLOTS, {
      method: 'POST',
      body: JSON.stringify({ emails, assignedSlot })
    });
  }

  // Attendance operations
  async updateUserAttendance(email, isPresent) {
    return this.request(API_ENDPOINTS.UPDATE_ATTENDANCE.replace('{email}', email), {
      method: 'PATCH',
      body: JSON.stringify({ isPresent })
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

  async updateAdminProfile(profileData) {
    return this.request(API_ENDPOINTS.ADMIN_UPDATE, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getAdminLogs(params = {}) {
    const { limit = 50, skip = 0, admin_email, status } = params;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      skip: skip.toString(),
      ...(admin_email && { admin_email }),
      ...(status && { status })
    });
    return this.request(`${API_ENDPOINTS.ADMIN_LOGS}?${queryParams}`);
  }

  // Settings operations
  async getSettings() {
    return this.request(API_ENDPOINTS.SETTINGS_GET);
  }

  async toggleResultStatus() {
    return this.request(API_ENDPOINTS.SETTINGS_TOGGLE_RESULT, {
      method: 'POST'
    });
  }

  // Email operations
  async sendEmail(emailData) {
    return this.request(API_ENDPOINTS.SEND_EMAIL, {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  async getEmailTemplates() {
    return this.request(API_ENDPOINTS.GET_EMAIL_TEMPLATES);
  }

  async saveEmailTemplate(templateData) {
    return this.request(API_ENDPOINTS.SAVE_EMAIL_TEMPLATE, {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
  }
}

// Export a default instance
export const apiClient = new ApiClient();

export default apiClient;
