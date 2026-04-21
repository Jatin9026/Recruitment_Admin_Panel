export const ENDEAVOUR_ROLE_RANKS = {
  attendance_coordinator: 1,
  event_manager: 1,
  content_manager: 1,
  kit_coordinator: 1,
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

export const ENDEAVOUR_ALLOWED_ROLES = {
  anyAdminSide: ["attendance_coordinator", "event_manager", "content_manager", "kit_coordinator", "admin", "superadmin"],
  adminPlus: ["admin", "superadmin"],
  superadminOnly: ["superadmin"],
  eventManagerPlus: ["event_manager", "admin", "superadmin"],
  attendanceCoordinatorPlus: ["attendance_coordinator", "admin", "superadmin"],
  kitCoordinatorPlus: ["kit_coordinator", "admin", "superadmin"],
  contentManagerPlus: ["content_manager", "admin", "superadmin"],
};
