export const ENDEAVOUR_ROLE_RANKS = {
  event_manager: 1,
  content_manager: 1,
  admin: 2,
  superadmin: 3,
};

export const normalizeEndeavourRole = (role) => {
  if (!role || typeof role !== "string") {
    return "";
  }

  return role.trim().toLowerCase().replace(/\s+/g, "_");
};

export const hasEndeavourRoleAccess = (userRole, requiredRole) => {
  const normalizedUserRole = normalizeEndeavourRole(userRole);
  const normalizedRequiredRole = normalizeEndeavourRole(requiredRole);

  const userRank = ENDEAVOUR_ROLE_RANKS[normalizedUserRole];
  const requiredRank = ENDEAVOUR_ROLE_RANKS[normalizedRequiredRole];

  if (!normalizedRequiredRole) {
    return Boolean(normalizedUserRole);
  }

  if (!requiredRank) {
    return normalizedUserRole === normalizedRequiredRole;
  }

  return (userRank || 0) >= requiredRank;
};

export const hasAnyEndeavourRoleAccess = (userRole, allowedRoles = []) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.some((role) => hasEndeavourRoleAccess(userRole, role));
};

/**
 * Check if user can access a specific page based on their role
 * @param {string} userRole - User's role
 * @param {string} pageName - Page to check access for (e.g., 'event', 'dashboard', 'teams')
 * @returns {boolean} - True if user can access the page
 */
export const canAccessEndeavourPage = (userRole, pageName) => {
  const normalizedRole = normalizeEndeavourRole(userRole);
  
  // Superadmin has access to all pages
  if (normalizedRole === "superadmin") {
    return true;
  }
  
  // Other roles (admin, event_manager, content_manager) can only access event page
  if (["admin", "event_manager", "content_manager"].includes(normalizedRole)) {
    return pageName === "event" || pageName === "events";
  }
  
  return false;
};

export const ENDEAVOUR_ALLOWED_ROLES = {
  superadminOnly: ["superadmin"],
  adminPlusRoles: ["admin", "event_manager", "content_manager", "superadmin"],
  // Event page access: all roles can access event page
  eventPageAccess: ["admin", "event_manager", "content_manager", "superadmin"],
  // Full access (all pages): only superadmin
  fullPageAccess: ["superadmin"],
  // Restricted roles (only event page access)
  eventPageOnly: ["admin", "event_manager", "content_manager"],
};
