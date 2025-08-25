


// export const ROLES = {
//     SUPERADMIN: "superadmin",
//     ADMIN: "admin",
//     USER: "user",
//   };
  

//   const ROLE_HIERARCHY = [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN];

//   export const hasPermission = (userRole, allowedRoles = []) => {
//     if (!userRole) return false;
//     return allowedRoles.includes(userRole);
//   };
  

//   export const isRoleHigherOrEqual = (roleA, roleB) => {
//     return ROLE_HIERARCHY.indexOf(roleA) >= ROLE_HIERARCHY.indexOf(roleB);
//   };
  



// src/utils/roleUtil.js

// Roles removed – always return true
export const hasPermission = () => true;
export const isRoleHigherOrEqual = () => true;
export const ROLES = {};
