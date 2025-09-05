import React, { useEffect } from "react";
import { create } from "zustand";


function ApplicantRow({ applicant, onView, onSelect, isSelected, disableCheckbox }) {
  const handleViewClick = () => {
    onView(applicant);
  };
  const handleSelectClick = () => {
    onSelect(applicant.id);
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors text-gray-800">
      <td className="px-2 py-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectClick}
          disabled={disableCheckbox}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      </td>
      <td className="px-2 py-3 text-left">{applicant.name}</td>
      <td className="px-2 py-3 text-left break-words">{applicant.email}</td>
      <td className="px-2 py-3 text-left">{applicant.department}</td>
      <td className="px-2 py-3 text-left">{applicant.libraryId}</td>
      <td className="px-2 py-3 text-left">{applicant.group || '—'}</td>
      <td className="px-2 py-3 text-right">
        <button
          onClick={handleViewClick}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition"
        >
          View
        </button>
      </td>
    </tr>
  );
}


const useApplicantStore = create((set, get) => ({
  applicants: [],
  selectedApplicant: null,
  selectedIds: [],
  slotDate: "",
  slotHour: "",
  endTime: "",
  roundDuration: "",
  batchSize: "",
  message: "",
  messageType: "",

  setMessage: (msg, type = 'info') => set({ message: msg, messageType: type }),

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
      setMessage
    } = get();

    if (!slotDate || !slotHour || !endTime || !roundDuration || !batchSize) {
      setMessage("Please fill all slot fields (date, start, end, duration, batch size)", 'error');
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

      const updatedApplicants = applicants.map((app) => {
        if (selectedIds.includes(app.id)) {
          return {
            ...app,
            slot: { startAt: `${slotDate}T${slotHour}:00` },
            group: app.group || Math.floor(Math.random() * 100) + 1,
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

      setMessage("Slots assigned successfully!", 'success');
    } catch (err) {
      console.error("Failed to assign slot:", err);
      setMessage("Failed to assign slot. Check console.", 'error');
    }
  },

  fetchApplicants: async () => {
    const { setMessage } = get();
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
     
      console.error("Failed to fetch applicants. This is likely a network or CORS issue.", err);
      setMessage("Failed to load applicants. The server is not responding, please check your network connection or try again later.", 'error');
    }
  },

  setSlotDate: (date) => set({ slotDate: date }),
  setSlotHour: (hour) => set({ slotHour: hour }),
  setEndTime: (end) => set({ endTime: end }),
  setRoundDuration: (dur) => set({ roundDuration: dur }),
  setBatchSize: (size) => set({ batchSize: size }),
}));

// A simple message box component
function MessageBox({ message, type, onClose }) {
  if (!message) return null;
  
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className={`fixed top-4 right-4 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-transform transform translate-x-0 ${bgColor}`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-lg font-bold">
          &times;
        </button>
      </div>
    </div>
  );
}


const useUIStore = create(() => ({
  theme: "light",
}));


function ApplicantDetailModal({ applicant, onClose }) {
  if (!applicant) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md animate-fadeIn overflow-auto max-h-[90vh]">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 border-b pb-2">
          Applicant Details
        </h2>
        <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 text-xs sm:text-sm">
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Name:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0">{applicant.name}</span>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Email:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0 break-all">
                {applicant.email}
              </span>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Phone:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0">{applicant.phone}</span>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Department:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0">
                {applicant.department}
              </span>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Year:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0">{applicant.year}</span>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Library ID:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0">
                {applicant.libraryId}
              </span>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Status:</strong>
              <span
                className={`ml-0 sm:ml-2 mt-1 sm:mt-0 inline-block px-2 py-0.5 rounded text-xs ${
                  applicant.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {applicant.status}
              </span>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Group:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0">
                {applicant.group || "—"}
              </span>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p>
              <strong>Check-In:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0">
                {applicant.checkIn ? "Yes" : "No"}
              </span>
            </p>
          </div>
          <div className="col-span-full space-y-2 sm:space-y-0">
            <p>
              <strong>Notes:</strong>{" "}
              <span className="block sm:inline mt-1 sm:mt-0">
                {applicant.notes || "—"}
              </span>
            </p>
          </div>
          <div className="col-span-full space-y-2 sm:space-y-0">
            <p>
              <strong>Applied At:</strong>
              <span className="block sm:inline mt-1 sm:mt-0 text-xs">
                {new Date(applicant.appliedAt).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition w-full sm:w-auto text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function ApplicantList() {
  const { theme } = useUIStore();
  const {
    applicants,
    selectedApplicant,
    selectedIds,
    slotDate,
    slotHour,
    endTime,
    roundDuration,
    batchSize,
    message,
    messageType,
    setSelectedApplicant,
    toggleSelect,
    select50,
    clearSelection,
    assignSlot,
    setSlotDate,
    setSlotHour,
    setEndTime,
    setRoundDuration,
    setBatchSize,
    fetchApplicants,
    setMessage,
  } = useApplicantStore();
  
  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const totalApplicants = applicants.length;

  const totalAssignedGroups = applicants.filter(app => app.group !== null && app.group !== undefined).length;

  function handleAssignSlot() {
    if (selectedIds.length === 0) {
      setMessage("Please select at least one applicant.", "error");
      return;
    }
    assignSlot();
  }

  function handleSelect50() {
    select50();
    setMessage("Selected the first 50 applicants.", "info");
  }

  function handleClearSelection() {
    clearSelection();
    setMessage("Selection cleared.", "info");
  }

  return (
    <div
      className={`p-3 sm:p-4 md:p-6 min-h-screen transition-colors ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <MessageBox 
        message={message} 
        type={messageType} 
        onClose={() => setMessage("", "")} 
      />
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">
        Applicants
      </h1>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
        <span className="font-semibold">Total Students: {totalApplicants}</span>
        <span className="font-semibold text-green-700">
          Groups Assigned: {totalAssignedGroups}
        </span>
      </div>

      <div className="bg-white shadow p-3 sm:p-4 rounded-md border mb-3 sm:mb-4">
        <div className="flex flex-col gap-3 sm:gap-2">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
            <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span>Date:</span>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="border px-2 py-1 rounded text-xs sm:text-sm"
              />
            </label>
            <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span>Start Time:</span>
              <input
                type="time"
                value={slotHour}
                onChange={(e) => setSlotHour(e.target.value)}
                className="border px-2 py-1 rounded text-xs sm:text-sm"
              />
            </label>
            <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span>End Time:</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border px-2 py-1 rounded text-xs sm:text-sm"
              />
            </label>
            <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span>Duration (min):</span>
              <input
                type="number"
                value={roundDuration}
                onChange={(e) => setRoundDuration(e.target.value)}
                className="border px-2 py-1 rounded text-xs sm:text-sm"
              />
            </label>
            <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span>Batch Size:</span>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="border px-2 py-1 rounded text-xs sm:text-sm"
              />
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleAssignSlot}
              disabled={selectedIds.length === 0}
              className={`px-3 sm:px-4 py-2 rounded-md text-white font-semibold transition text-xs sm:text-sm ${
                selectedIds.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Assign Slot 
            </button>
            <button
              onClick={handleSelect50}
              className="bg-blue-600 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded transition"
            >
              Select 50 Students
            </button>
            <button
              onClick={handleClearSelection}
              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 transition text-xs sm:text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="overflow-x-auto overflow-y-auto h-[60vh] sm:h-[65vh] bg-white shadow rounded-md border">
          <table className="w-full text-xs sm:text-sm md:text-base min-w-max">
            <thead className="bg-gray-100 sticky top-0 shadow-sm">
              <tr>
                <th className="px-2 py-2 text-center">Select</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2 text-left">Email</th>
                <th className="px-2 py-2 text-left">Department</th>
                <th className="px-2 py-2 text-left">Library ID</th>
                <th className="px-2 py-2 text-left">Group</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No applicants found
                  </td>
                </tr>
              ) : (
                applicants.map((app) => (
                  <ApplicantRow
                    key={app._id || app.id}
                    applicant={app}
                    onView={setSelectedApplicant}
                    onSelect={toggleSelect}
                    isSelected={selectedIds.includes(app._id || app.id)}
                    disableCheckbox={!!app.group}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sm:hidden">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {applicants.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-white rounded-md border">
              No applicants found
            </div>
          ) : (
            applicants.map((app) => (
              <div key={app.id || app._id} className="bg-white border rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        disabled={!!app.group}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <h3 className="font-medium text-sm">{app.name}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedApplicant(app)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition"
                    >
                      View
                    </button>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="truncate ml-2 max-w-[60%]">
                        {app.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <span>{app.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Library ID:</span>
                      <span>{app.libraryId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Group:</span>
                      <span className="text-green-600 font-medium">
                        {app.group || 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </div>
  );
}
