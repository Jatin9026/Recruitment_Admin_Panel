import { create } from "zustand";
import { apiClient } from "../utils/apiConfig";

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

  selectUnassigned: () =>
    set((state) => ({
      selectedIds: state.applicants
        .filter((a) => !a.groupNumber || a.groupNumber === null || a.groupNumber === undefined)
        .slice(0, 50)
        .map((a) => a.id),
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

    // Filter selected applicants to only include those without group numbers
    const selectedApplicants = applicants.filter((a) =>
      selectedIds.includes(a.id) && (!a.groupNumber || a.groupNumber === null || a.groupNumber === undefined)
    );

    if (selectedApplicants.length === 0) {
      alert("No unassigned applicants selected. Only applicants without group numbers can be assigned slots.");
      return;
    }

    // Check if some selected applicants already have groups
    const selectedWithGroups = applicants.filter((a) =>
      selectedIds.includes(a.id) && (a.groupNumber && a.groupNumber !== null && a.groupNumber !== undefined)
    );

    if (selectedWithGroups.length > 0) {
      const proceed = confirm(`${selectedWithGroups.length} selected applicants already have groups and will be skipped. Proceed with ${selectedApplicants.length} unassigned applicants?`);
      if (!proceed) return;
    }

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
      const result = await apiClient.bulkCreateRounds(payload);

      // Update local state based on API response
      const updatedApplicants = applicants.map((app) => {
        const wasAssigned = selectedApplicants.find((sa) => sa.id === app.id);
        if (wasAssigned) {
          return {
            ...app,
            slot: { startAt: `${slotDate}T${slotHour}:00` },
            status: "scheduled", // Update status as per API response
            groupNumber: result.batches?.find(batch =>
              batch.users.includes(app.email)
            )?.groupNumber || Math.floor(Math.random() * 100) + 1,
          };
        }
        return app;
      });

      set({
        applicants: updatedApplicants,
        selectedIds: [],
        slotDate: "",
        slotHour: "",
        endTime: "",
        roundDuration: "",
        batchSize: "",
      });

      alert(`Slots assigned successfully! ${result.totalUsersScheduled || selectedApplicants.length} applicants scheduled in ${result.totalBatches || 1} batches.`);
    } catch (err) {
      console.error("Failed to assign slot:", err);
      alert(`Failed to assign slot: ${err.message}`);
    }
  },

  fetchApplicants: async () => {
    try {
      const response = await apiClient.getUsers();
      const data = response.data || response; // Handle both response formats

      const mapped = data.map((u) => ({
        id: u._id?.$oid || u._id || u.id,
        name: u.name,
        email: u.email,
        phone: u.phone?.$numberLong || u.phone,
        year: u.year,
        libraryId: u.lib_id,
        linkedIn: u.linkedIn || "",
        department: u.branch,
        whyEcell: u.why_ecell || "",
        domainPrefOne: u.domain_pref_one || {},
        domainPrefTwo: u.domain_pref_two || {},
        domains: u.domains || [],
        groupNumber: u.groupNumber || null,
        appliedAt: u.createdAt || new Date().toISOString(),
        shortlisted: u.shortlisted || false,
        // Round status objects
        screening: u.screening || {},
        gd: u.gd || {},
        pi: u.pi || {},
        task: u.task || {},
      }));

      // console.log("Fetched applicants:", mapped.length, "GD Selected:", mapped.filter(a => a.gd && a.gd.status === "selected").length);
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
