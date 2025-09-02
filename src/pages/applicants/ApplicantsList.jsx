import React from "react";
import useUIStore from "../../store/uiStore";
import useApplicantStore from "../../store/applicantStore";
import ApplicantRow from "./ApplicantRow";

function ApplicantDetailModal({ applicant, onClose }) {
  if (!applicant) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md animate-fadeIn overflow-auto max-h-[90vh]">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 border-b pb-2">Applicant Details</h2>
        <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 text-xs sm:text-sm">
          <div className="space-y-2 sm:space-y-0">
            <p><strong>Name:</strong> <span className="block sm:inline mt-1 sm:mt-0">{applicant.name}</span></p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p><strong>Email:</strong> <span className="block sm:inline mt-1 sm:mt-0 break-all">{applicant.email}</span></p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p><strong>Phone:</strong> <span className="block sm:inline mt-1 sm:mt-0">{applicant.phone}</span></p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p><strong>Department:</strong> <span className="block sm:inline mt-1 sm:mt-0">{applicant.department}</span></p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p><strong>Year:</strong> <span className="block sm:inline mt-1 sm:mt-0">{applicant.year}</span></p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p><strong>Library ID:</strong> <span className="block sm:inline mt-1 sm:mt-0">{applicant.libraryId}</span></p>
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
            <p><strong>Group:</strong> <span className="block sm:inline mt-1 sm:mt-0">{applicant.group || "—"}</span></p>
          </div>
          <div className="space-y-2 sm:space-y-0">
            <p><strong>Check-In:</strong> <span className="block sm:inline mt-1 sm:mt-0">{applicant.checkIn ? "Yes" : "No"}</span></p>
          </div>
          <div className="col-span-full space-y-2 sm:space-y-0">
            <p><strong>Notes:</strong> <span className="block sm:inline mt-1 sm:mt-0">{applicant.notes || "—"}</span></p>
          </div>
          <div className="col-span-full space-y-2 sm:space-y-0">
            <p>
              <strong>Applied At:</strong> 
              <span className="block sm:inline mt-1 sm:mt-0 text-xs">{new Date(applicant.appliedAt).toLocaleString()}</span>
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

export default function ApplicantList() {
  const { theme } = useUIStore();
  const {
    applicants,
    selectedApplicant,
    selectedIds,
    slotDate,
    slotHour,
    setSelectedApplicant,
    toggleSelect,
    select50,
    clearSelection,
    assignSlot,
    setSlotDate,
    setSlotHour,
  } = useApplicantStore();

  const totalApplicants = applicants.length;
  const totalAssignedSlots = applicants.filter((a) => a.slot?.startAt).length;

  function handleAssignSlot() {
    if (selectedIds.length === 0) return;
    assignSlot();
    clearSelection();
  }

  function handleSelect50() {
    select50(); 
  }

  function handleClearSelection() {
    clearSelection();
  }

  return (
    <div
      className={`p-3 sm:p-4 md:p-6 min-h-screen transition-colors ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">Applicants</h1>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
        <span className="font-semibold">Total Students: {totalApplicants}</span>
        <span className="font-semibold text-green-700">Slots Assigned: {totalAssignedSlots}</span>
      </div>

      <div className="bg-white shadow p-3 sm:p-4 rounded-md border mb-3 sm:mb-4">
        <div className="flex flex-col gap-3 sm:gap-2">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
            <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm min-w-0">
              <span className="whitespace-nowrap">Date:</span>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="border px-2 py-1 rounded text-xs sm:text-sm w-full sm:w-auto"
              />
            </label>
            <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm min-w-0">
              <span className="whitespace-nowrap">Time:</span>
              <input
                type="time"
                step="3600"
                value={slotHour}
                onChange={(e) => setSlotHour(e.target.value)}
                className="border px-2 py-1 rounded text-xs sm:text-sm w-full sm:w-auto"
              />
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleAssignSlot}
              disabled={selectedIds.length === 0}
              className={`px-3 sm:px-4 py-2 rounded-md text-white font-semibold transition text-xs sm:text-sm ${
                selectedIds.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Assign Slot ({selectedIds.length})
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
                <th className="px-2 py-2 text-left">Slot</th>
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
                    key={app.id}
                    applicant={app}
                    onView={setSelectedApplicant}
                    onSelect={toggleSelect}
                    isSelected={selectedIds.includes(app.id)}
                    disableCheckbox={!!app.slot?.startAt} 
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
              <div key={app.id} className="bg-white border rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        disabled={!!app.slot?.startAt}
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
                      <span className="truncate ml-2 max-w-[60%]">{app.email}</span>
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
                      <span>Slot:</span>
                      <span className={app.slot?.startAt ? "text-green-600" : "text-gray-400"}>
                        {app.slot?.startAt ? new Date(app.slot.startAt).toLocaleString() : "Not assigned"}
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
