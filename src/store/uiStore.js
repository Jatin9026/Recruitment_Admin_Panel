
import { create } from "zustand";

const useUIStore = create((set) => ({

  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  activeModal: null, 
  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),


  notification: null,
  showNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
}));

export default useUIStore;
