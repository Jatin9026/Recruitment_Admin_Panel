import { create } from "zustand";
import { apiClient } from "../utils/apiConfig";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.adminLogin(credentials.email, credentials.password);
      
      set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      await get().fetchUser();
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || "Login failed";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUser: async () => {
    const token = get().accessToken;
    if (!token) return;

    try {
      const data = await apiClient.getAdminInfo();
      set({ user: data });
      localStorage.setItem("adminUser", JSON.stringify(data));
    } catch (error) {
      set({ error: error.message || "Failed to fetch user" });
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      console.warn("No refresh token available");
      get().logout();
      return false;
    }

    try {
      set({ isLoading: true, error: null });
      
      const data = await apiClient.refreshAdminToken(refreshToken);
      
      set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Use new refresh token if provided, otherwise keep existing
        isLoading: false,
      });
      
      localStorage.setItem("accessToken", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
      }
      
      console.log("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      set({ error: "Session expired. Please log in again.", isLoading: false });
      get().logout();
      return false;
    }
  },

  // Helper function to update tokens from external refresh
  updateTokens: (accessToken, refreshToken) => {
    set({
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    // Clear local state and storage (no admin logout endpoint available)
    set({ 
      user: null, 
      isAuthenticated: false, 
      accessToken: null, 
      refreshToken: null, 
      error: null,
      isInitialized: true // Keep initialized state on logout
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("adminUser");
    
    // Clean up global callbacks
    if (typeof window !== 'undefined') {
      delete window.refreshAuthStore;
      delete window.logoutCallback;
      delete window.showTokenRefreshNotification;
      delete window.dismissToast;
    }
  },

  initializeAuth: () => {
    const state = get();
    
    // If already initialized, don't do it again
    if (state.isInitialized) {
      return;
    }

    // Set up global callbacks for API client
    window.refreshAuthStore = (accessToken, refreshToken) => {
      get().updateTokens(accessToken, refreshToken);
    };
    
    window.logoutCallback = () => {
      get().logout();
    };

    window.showTokenRefreshNotification = () => {
      // Show a subtle loading notification that token is being refreshed and return toast ID
      if (typeof window !== 'undefined' && window.showToast) {
        return window.showToast('Refreshing session...', { type: 'loading', duration: 10000 });
      }
      return null;
    };

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("adminUser");

    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        user: savedUser ? JSON.parse(savedUser) : null,
        isInitialized: true,
      });

      if (!savedUser) get().fetchUser();
    } else {
      // No tokens found, mark as initialized but not authenticated
      set({ isInitialized: true, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
