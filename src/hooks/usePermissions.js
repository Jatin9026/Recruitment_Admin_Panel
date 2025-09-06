import { useMemo } from 'react';
import useAuthStore from '../store/authStore';
import { hasPermission } from '../utils/rolePermissions';

/**
 * Custom hook to check if the current user has specific permissions
 * @param {string[]} requiredRoles - Array of roles that have access
 * @returns {boolean} - Whether the user has permission
 */
export const usePermission = (requiredRoles) => {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    return hasPermission(user?.role, requiredRoles);
  }, [user?.role, requiredRoles]);
};

/**
 * Custom hook to get the current user's role
 * @returns {string|null} - Current user's role
 */
export const useUserRole = () => {
  const { user } = useAuthStore();
  return user?.role || null;
};

/**
 * Custom hook to check if user is SuperAdmin
 * @returns {boolean} - Whether the user is SuperAdmin
 */
export const useIsSuperAdmin = () => {
  const { user } = useAuthStore();
  return user?.role === 'SuperAdmin';
};

/**
 * Custom hook to check multiple permission sets
 * @param {Object} permissions - Object with permission keys and required roles
 * @returns {Object} - Object with same keys but boolean values
 */
export const useMultiplePermissions = (permissions) => {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    const result = {};
    Object.entries(permissions).forEach(([key, requiredRoles]) => {
      result[key] = hasPermission(user?.role, requiredRoles);
    });
    return result;
  }, [user?.role, permissions]);
};
