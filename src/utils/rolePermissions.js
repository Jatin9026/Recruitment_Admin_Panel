// Role-based access control definitions
// This file centralizes all role permissions for easy maintenance

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  GD_PROCTOR: 'GDProctor', 
  INTERVIEWER: 'Interviewer',
  ADMIN: 'Admin'
};

export const ROUTE_PERMISSIONS = {
  // Dashboard
  dashboard: [ROLES.SUPER_ADMIN, ROLES.GD_PROCTOR, ROLES.INTERVIEWER, ROLES.ADMIN],
  
  // Applicants Management
  applicants: [ROLES.SUPER_ADMIN, ROLES.GD_PROCTOR],
  
  // Attendance Management
  attendance: [ROLES.SUPER_ADMIN, ROLES.GD_PROCTOR, ROLES.INTERVIEWER, ROLES.ADMIN],
  
  // Groups Management (GD)
  groups: [ROLES.SUPER_ADMIN, ROLES.GD_PROCTOR],
  
  // Screening Process
  screening: [ROLES.SUPER_ADMIN],
  
  // Interview Management
  interviews: [ROLES.SUPER_ADMIN, ROLES.INTERVIEWER],
  
  // Slots Management
  slots: [ROLES.SUPER_ADMIN],
  
  // Email Management
  mailTemplates: [ROLES.SUPER_ADMIN],
  bulkMail: [ROLES.SUPER_ADMIN],
  
  // Task Management
//   tasks: [ROLES.SUPER_ADMIN],
  
  // Admin Management
  createAdmin: [ROLES.SUPER_ADMIN],
  adminLogs: [ROLES.SUPER_ADMIN]
};

// Helper function to check if user has access to a specific feature
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles) return false;
  return requiredRoles.includes(userRole);
};

// Helper function to get all allowed roles for a feature
export const getAllowedRoles = (feature) => {
  return ROUTE_PERMISSIONS[feature] || [];
};
