import { create } from "zustand";
import { endeavourApiClient } from "../utils/endeavourApiConfig";

const USER_KEY = "endeavourAdminUser";
const TOKEN_KEY = "endeavourAccessToken";

export const useEndeavourAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  initializeAuth: () => {
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
      const parsedUser = JSON.parse(storedUser);
      set({
        isInitialized: true,
        isAuthenticated: true,
        user: parsedUser,
        accessToken: token,
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

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(actor));

      set({
        user: actor,
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
