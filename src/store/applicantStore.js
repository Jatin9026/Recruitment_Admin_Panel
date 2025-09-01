
import { create } from "zustand";
import dummyApplicants from "../data/dummyApplicants"; 

const useApplicantStore = create((set, get) => ({
  applicants: dummyApplicants,
  selectedApplicant: null,
  selectedIds: [],
  slotDate: "",
  slotHour: "",


  setSelectedApplicant: (applicant) => set({ selectedApplicant: applicant }),

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


  select50: () =>
    set((state) => ({
      selectedIds: state.applicants.slice(0, 50).map((a) => a.id),
    })),


  clearSelection: () => set({ selectedIds: [] }),
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
