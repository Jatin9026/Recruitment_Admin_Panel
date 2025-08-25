
import { create } from "zustand";
import dummyApplicants from "../data/dummyApplicants";
import dummyAudit from "../data/dummyAudit"; 

const useApplicantStore = create((set, get) => ({
  applicants: dummyApplicants,
  selectedApplicant: null,
  loading: false,
  error: null,


  fetchApplicants: async () => {
    try {
      set({ loading: true, error: null });
      const data = dummyApplicants;
      set({ applicants: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addApplicant: (newApplicant) => {
    set((state) => ({
      applicants: [...state.applicants, newApplicant],
    }));
    dummyAudit.push({
      id: dummyAudit.length + 1,
      action: "CREATE",
      entity: "Applicant",
      entityId: newApplicant.id,
      timestamp: new Date().toISOString(),
      performedBy: "AdminUser",
    });
  },

  updateApplicant: (id, updates) => {
    set((state) => ({
      applicants: state.applicants.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
    dummyAudit.push({
      id: dummyAudit.length + 1,
      action: "UPDATE",
      entity: "Applicant",
      entityId: id,
      timestamp: new Date().toISOString(),
      performedBy: "AdminUser",
    });
  },

  deleteApplicant: (id) => {
    set((state) => ({
      applicants: state.applicants.filter((a) => a.id !== id),
    }));
    dummyAudit.push({
      id: dummyAudit.length + 1,
      action: "DELETE",
      entity: "Applicant",
      entityId: id,
      timestamp: new Date().toISOString(),
      performedBy: "AdminUser",
    });
  },

  selectApplicant: (id) => {
    const found = get().applicants.find((a) => a.id === id) || null;
    set({ selectedApplicant: found });
  },

  clearSelection: () => set({ selectedApplicant: null }),
}));

export default useApplicantStore;
