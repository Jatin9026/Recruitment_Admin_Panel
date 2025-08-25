// import { create } from "zustand";
// import Cookies from "js-cookie";

// export const useAuthStore = create((set) => ({
//   user: null,
//   isAuthenticated: false,

//   login: async ({ email, password }) => {
//     const dummyUser = {
//       id: "u1",
//       name: "Admin User",
//       email: "admin@club.com",
//       token: "dummy-jwt-token",
//     };

//     if (email === "admin@club.com" && password === "admin123") {
//       Cookies.set("jwt", dummyUser.token, { sameSite: "strict" });
//       set({
//         user: dummyUser,
//         isAuthenticated: true,
//       });
//       return { success: true, user: dummyUser };
//     }

//     return { success: false, error: "Invalid credentials" };
//   },

//   logout: () => {
//     Cookies.remove("jwt");
//     set({ user: null, isAuthenticated: false });
//   },

//   getToken: () => Cookies.get("jwt"),
// }));






import { create } from "zustand";

export const useAuthStore = create(() => ({
  user: {
    id: "u1",
    name: "Admin User",
    email: "admin@club.com",
  },
  isAuthenticated: true,
}));
