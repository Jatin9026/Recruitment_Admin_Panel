import { create } from "zustand";

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
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();
        if (!response.ok) {
          set({ error: data.detail || "Login failed", isLoading: false });
          return { success: false, error: data.detail };
        }
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
      } catch (err) {
        set({ error: err.message || "Network error", isLoading: false });
        return { success: false, error: err.message };
      }
    },

  fetchUser: async () => {
    const token = get().accessToken;
    if (!token) return;

    try {
      const response = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data });
        localStorage.setItem("adminUser", JSON.stringify(data));
      } else {
        set({ error: "Failed to fetch user" });
      }
    } catch (err) {
      set({ error: err.message });
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return;

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      if (response.ok) {
        set({ accessToken: data.access_token });
        localStorage.setItem("accessToken", data.access_token);
      } else {
        get().logout();
      }
    } catch {
      get().logout();
    }
  },

  logout: () => {
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
