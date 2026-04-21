import { create } from "zustand";
import { endeavourApiClient } from "../utils/endeavourApiConfig";
import { normalizeEndeavourRole } from "../utils/endeavourRoleAccess";

const USER_KEY = "endeavourAdminUser";
const TOKEN_KEY = "endeavourAccessToken";

const buildNormalizedUser = (user = {}) => {
  return {
    ...user,
    id: user?.id || user?.user_id || user?.actor_id || "",
    role: normalizeEndeavourRole(user?.role),
  };
};

export const useEndeavourAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  initializeAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!token || !storedUser) {
      set({
        isInitialized: true,
        isAuthenticated: false,
        user: null,
        accessToken: null,
      });
      return;
    }

    try {
      const parsedUser = buildNormalizedUser(JSON.parse(storedUser));

      const meResponse = await endeavourApiClient.getCurrentUser();
      const currentUserRole = normalizeEndeavourRole(meResponse?.role);
      const currentUserId = meResponse?.user_id || parsedUser?.id || "";

      if (!currentUserRole) {
        throw new Error("Unable to validate user role");
      }

      const hydratedUser = {
        ...parsedUser,
        id: currentUserId,
        role: currentUserRole,
      };

      localStorage.setItem(USER_KEY, JSON.stringify(hydratedUser));

      set({
        isInitialized: true,
        isAuthenticated: true,
        user: hydratedUser,
        accessToken: token,
        error: null,
      });
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      set({
        isInitialized: true,
        isAuthenticated: false,
        user: null,
        accessToken: null,
      });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });

    if (!email?.trim() || !password?.trim()) {
      set({ isLoading: false, error: "Email and password are required" });
      return { success: false, error: "Email and password are required" };
    }

    try {
      const response = await endeavourApiClient.adminLogin(email.trim().toLowerCase(), password.trim());
      const token = response?.token || response?.access_token;
      const actor = response?.actor || response?.data?.actor;

      if (!token || !actor) {
        throw new Error("Invalid login response from server");
      }

      const normalizedActor = buildNormalizedUser(actor);

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedActor));

      set({
        user: normalizedActor,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error?.message || "Unable to login";
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => {
    set({ error: null });
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: true,
    });
  },
}));

if (typeof window !== "undefined") {
  window.endeavourLogoutCallback = () => {
    const { logout } = useEndeavourAuthStore.getState();
    logout();
    window.location.href = "/endeavour/login";
  };
}

export default useEndeavourAuthStore;
