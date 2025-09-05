import { create } from "zustand";

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
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    })),

  select50: () =>
    set((state) => ({
      selectedIds: state.applicants.slice(0, 50).map((a) => a.id),
    })),

  clearSelection: () => set({ selectedIds: [] }),

  assignSlot: async () => {
    const {
      slotDate,
      slotHour,
      endTime,
      roundDuration,
      batchSize,
      selectedIds,
      applicants,
    } = get();

    if (!slotDate || !slotHour || !endTime || !roundDuration || !batchSize) {
      alert("Please fill all slot fields (date, start, end, duration, batch size)");
      return;
    }

    const selectedApplicants = applicants.filter((a) =>
      selectedIds.includes(a.id)
    );
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
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "https://rec-backend-z2qa.onrender.com/api/users/bulk/create-rounds",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      await res.json();

      const updatedApplicants = applicants.map((app) =>
        selectedIds.includes(app.id)
          ? {
              ...app,
              slot: { startAt: `${slotDate}T${slotHour}:00` },
              group: app.group || Math.floor(Math.random() * 100) + 1, // Assign group if not exists
            }
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
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "https://rec-backend-z2qa.onrender.com/api/users/get",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      const data = await res.json();

      const mapped = data.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        year: u.year,
        libraryId: u.lib_id,
        department: u.branch,
        group: u.groupNumber || null,
        status: "Pending",
        appliedAt: u.createdAt || new Date().toISOString(),
        slot: u.slot || null,
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
