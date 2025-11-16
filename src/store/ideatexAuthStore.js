import { create } from "zustand";
import { ideatexApiClient } from "../utils/ideatexApiConfig";

const useIdeatexAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Ideatex login attempt:', credentials.email);
      const response = await ideatexApiClient.adminLogin(credentials.email, credentials.password);
      console.log('Ideatex login response:', response);
      
      // Handle different response structures
      const accessToken = response.data?.token || response.token || response.access_token || response.accessToken;
      const userData = response.data?.admin || response.admin || response.user || response.data;
      
      if (!accessToken) {
        throw new Error('No access token received from server');
      }
      
      set({
        accessToken: accessToken,
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem("ideatexAccessToken", accessToken);
      localStorage.setItem("ideatexAdminUser", JSON.stringify(userData));

      console.log('Ideatex login successful');
      return { success: true };
    } catch (error) {
      console.error('Ideatex login error:', error);
      const errorMessage = error.message || "Login failed";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUser: async () => {
    const token = get().accessToken;
    if (!token) {
      console.log('Ideatex: No token available for fetchUser');
      return;
    }

    try {
      console.log('Ideatex: Fetching user profile...');
      const response = await ideatexApiClient.getAdminProfile();
      console.log('Ideatex: User profile response:', response);
      
      // Handle different response structures
      const userData = response.data || response.user || response;
      
      set({ user: userData });
      localStorage.setItem("ideatexAdminUser", JSON.stringify(userData));
      console.log('Ideatex: User profile saved successfully');
    } catch (error) {
      console.error('Ideatex: Failed to fetch user profile:', error);
      set({ error: error.message || "Failed to fetch user" });
    }
  },

  logout: () => {
    // Clear local state and storage
    set({ 
      user: null, 
      isAuthenticated: false, 
      accessToken: null, 
      error: null,
      isInitialized: true
    });
    localStorage.removeItem("ideatexAccessToken");
    localStorage.removeItem("ideatexAdminUser");
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    try {
      const token = localStorage.getItem("ideatexAccessToken");
      const userStr = localStorage.getItem("ideatexAdminUser");

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error("Failed to initialize Ideatex auth:", error);
      set({ isInitialized: true });
    }
  },
}));

// Set up global logout callback for API client
if (typeof window !== 'undefined') {
  window.ideatexLogoutCallback = () => {
    const { logout } = useIdeatexAuthStore.getState();
    logout();
    
    // Redirect to login
    window.location.href = '/login';
  };
}

export { useIdeatexAuthStore };
export default useIdeatexAuthStore;
