import { create } from "zustand";
import { apiClient } from "../../utils/apiConfig";

const useApplicantStore = create((set, get) => ({
  applicants: [],
  selectedApplicant: null,
  selectedIds: [],
  slotDate: "",
  slotHour: "",
  endTime: "",
  roundDuration: "",
  batchSize: "",

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

  assignSlot: async () => {
    const { slotDate, slotHour, endTime, roundDuration, batchSize, selectedIds, applicants } = get();

    if (!slotDate || !slotHour || !endTime || !roundDuration || !batchSize) {
      alert("Please fill all slot fields (date, start, end, duration, batch size)");
      return;
    }

    const selectedApplicants = applicants.filter((a) => selectedIds.includes(a.id));
    const emails = selectedApplicants.map((a) => a.email);

    const payload = {
      emails,
      batchSize: Number(batchSize),
      startDate: slotDate,
      startTime: slotHour,
      endTime,
      roundDuration: Number(roundDuration),
    };

    try {
      const data = await apiClient.bulkCreateRounds(payload);

      // update local state
      const updatedApplicants = applicants.map((app) =>
        selectedIds.includes(app.id)
          ? { ...app, slot: { startAt: `${slotDate}T${slotHour}:00` } }
          : app
      );

      set({
        applicants: updatedApplicants,
        selectedIds: [],
        slotDate: "",
        slotHour: "",
        endTime: "",
        roundDuration: "",
        batchSize: "",
      });

      alert("Slots assigned successfully!");
    } catch (err) {
      console.error("Failed to assign slot:", err);
      alert("Failed to assign slot. Check console.");
    }
  },

  fetchApplicants: async () => {
    try {
      const data = await apiClient.getUsers();

      const mapped = data.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        year: u.year,
        libraryId: u.lib_id,
        department: u.branch,
        group: u.groupNumber,
        appliedAt: u.createdAt || new Date().toISOString(),
        slot: null,
      }));

      set({ applicants: mapped });
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    }
  },

  setSlotDate: (date) => set({ slotDate: date }),
  setSlotHour: (hour) => set({ slotHour: hour }),
  setEndTime: (end) => set({ endTime: end }),
  setRoundDuration: (dur) => set({ roundDuration: dur }),
  setBatchSize: (size) => set({ batchSize: size }),
}));

export default useApplicantStore;
