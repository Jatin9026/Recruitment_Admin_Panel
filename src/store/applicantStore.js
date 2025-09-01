// store/applicantStore.js
import { create } from "zustand";
import dummyApplicants from "../data/dummyApplicants"; // fallback until API is used

const useApplicantStore = create((set, get) => ({
  applicants: dummyApplicants,
  selectedApplicant: null,
  selectedIds: [],
  slotDate: "",
  slotHour: "",

  // Select a single applicant for detail modal
  setSelectedApplicant: (applicant) => set({ selectedApplicant: applicant }),

  // Toggle selection (max 15 rule)
  toggleSelect: (id) =>
    set((state) => {
      if (state.selectedIds.includes(id)) {
        return { selectedIds: state.selectedIds.filter((sid) => sid !== id) };
      }
      if (state.selectedIds.length >= 15) {
        alert("You can select only up to 15 students (use bulk 50 instead)");
        return {};
      }
      return { selectedIds: [...state.selectedIds, id] };
    }),

  // Select first 50
  select50: () =>
    set((state) => ({
      selectedIds: state.applicants.slice(0, 50).map((a) => a.id),
    })),

  // Clear all
  clearSelection: () => set({ selectedIds: [] }),

  // Update slot assignment for selected applicants
  assignSlot: () => {
    const { slotDate, slotHour, selectedIds, applicants } = get();
    if (!slotDate || !slotHour) {
      alert("Please select both date and time (hour)");
      return;
    }
    const slotDateTime = new Date(`${slotDate}T${slotHour}:00`);
    const updatedApplicants = applicants.map((app) =>
      selectedIds.includes(app.id) ? { ...app, slot: { startAt: slotDateTime } } : app
    );
    set({
      applicants: updatedApplicants,
      selectedIds: [],
      slotDate: "",
      slotHour: "",
    });
    alert("Slot assigned successfully");
  },

  // API Fetch (plug-in later)
  fetchApplicants: async () => {
    try {
      const res = await fetch("/api/applicants");
      const data = await res.json();
      set({ applicants: data });
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    }
  },

  setSlotDate: (date) => set({ slotDate: date }),
  setSlotHour: (hour) => set({ slotHour: hour }),
}));

export default useApplicantStore;
