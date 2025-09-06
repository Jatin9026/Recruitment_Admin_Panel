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
    // No refresh token endpoint available for admin authentication
    // Admin tokens should be long-lived or require re-login
    console.warn("No refresh token endpoint available for admin authentication");
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      get().logout();
      return;
    }
    
    // For now, if refresh is needed, redirect to login
    get().logout();
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
  },

  initializeAuth: () => {
    const state = get();
    
    // If already initialized, don't do it again
    if (state.isInitialized) {
      return;
    }

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
