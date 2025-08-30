

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 🔹 Dummy datasets
const dummyApplicants = [
  { id: 1, personalInfo: { name: "Alice Johnson", email: "alice@mail.com", college: "MIT" }, slot: { startAt: "2025-09-01 10:00" }, status: "REGISTERED" },
  { id: 2, personalInfo: { name: "Bob Smith", email: "bob@mail.com", college: "Stanford" }, slot: { startAt: "2025-09-01 11:00" }, status: "GD_PASSED" },
  { id: 3, personalInfo: { name: "Charlie Lee", email: "charlie@mail.com", college: "Harvard" }, slot: { startAt: "—" }, status: "REJECTED" },
];

const dummyGroups = [
  { id: 1, name: "Group A", applicants: [1, 2] },
  { id: 2, name: "Group B", applicants: [] },
];

const dummyTasks = [
  { id: 1, title: "Frontend Assignment", deadline: "2025-09-10" },
  { id: 2, title: "Backend Assignment", deadline: "2025-09-12" },
];

const dummySlots = [
  { id: 1, startAt: "2025-09-05 10:00" },
  { id: 2, startAt: "2025-09-05 11:00" },
];

// 🔹 Mock API functions (simulate axios responses)
export const AuthAPI = {
  login: async (data) => {
    await delay(500);
    return { data: { token: "fake-jwt-token", user: { id: 1, name: "Admin User", role: "ADMIN" } } };
  },
  register: async (data) => {
    await delay(500);
    return { data: { success: true, user: { id: Date.now(), ...data } } };
  },
  getProfile: async () => {
    await delay(300);
    return { data: { id: 1, name: "Admin User", role: "ADMIN" } };
  },
};

export const ApplicantAPI = {
  getAll: async () => {
    await delay(400);
    return { data: dummyApplicants };
  },
  getById: async (id) => {
    await delay(200);
    return { data: dummyApplicants.find((a) => a.id === id) };
  },
  create: async (data) => {
    await delay(300);
    const newApp = { id: Date.now(), ...data };
    dummyApplicants.push(newApp);
    return { data: newApp };
  },
  update: async (id, data) => {
    await delay(300);
    const idx = dummyApplicants.findIndex((a) => a.id === id);
    if (idx !== -1) dummyApplicants[idx] = { ...dummyApplicants[idx], ...data };
    return { data: dummyApplicants[idx] };
  },
  delete: async (id) => {
    await delay(200);
    const idx = dummyApplicants.findIndex((a) => a.id === id);
    if (idx !== -1) dummyApplicants.splice(idx, 1);
    return { data: { success: true } };
  },
};

export const GroupAPI = {
  getAll: async () => {
    await delay(300);
    return { data: dummyGroups };
  },
  assignApplicant: async (groupId, applicantId) => {
    await delay(300);
    const group = dummyGroups.find((g) => g.id === groupId);
    if (group) group.applicants.push(applicantId);
    return { data: group };
  },
};

export const TaskAPI = {
  getAll: async () => {
    await delay(300);
    return { data: dummyTasks };
  },
  assignTask: async (taskId, applicantId) => {
    await delay(300);
    return { data: { taskId, applicantId, status: "assigned" } };
  },
};

export const MailAPI = {
  sendBulk: async (data) => {
    await delay(400);
    return { data: { success: true, sent: data.recipients?.length || 0 } };
  },
  sendSingle: async (data) => {
    await delay(300);
    return { data: { success: true, to: data.email } };
  },
};

export const SlotAPI = {
  getAll: async () => {
    await delay(200);
    return { data: dummySlots };
  },
  create: async (data) => {
    await delay(300);
    const newSlot = { id: Date.now(), ...data };
    dummySlots.push(newSlot);
    return { data: newSlot };
  },
  delete: async (id) => {
    await delay(200);
    const idx = dummySlots.findIndex((s) => s.id === id);
    if (idx !== -1) dummySlots.splice(idx, 1);
    return { data: { success: true } };
  },
};
