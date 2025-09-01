import React from "react";
import useUIStore from "../../store/uiStore";
import useApplicantStore from "../../store/applicantStore";
import ApplicantRow from "./ApplicantRow";
import toast, { Toaster } from "react-hot-toast";

function ApplicantDetailModal({ applicant, onClose }) {
  if (!applicant) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fadeIn">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Applicant Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>Name:</strong> {applicant.name}</p>
          <p><strong>Email:</strong> {applicant.email}</p>
          <p><strong>Phone:</strong> {applicant.phone}</p>
          <p><strong>Department:</strong> {applicant.department}</p>
          <p><strong>Year:</strong> {applicant.year}</p>
          <p><strong>Library ID:</strong> {applicant.libraryId}</p>
          <p>
            <strong>Status:</strong>
            <span
              className={`ml-2 px-2 py-0.5 rounded text-xs ${
                applicant.status === "Approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {applicant.status}
            </span>
          </p>
          <p><strong>Group:</strong> {applicant.group || "—"}</p>
          <p><strong>Check-In:</strong> {applicant.checkIn ? "Yes" : "No"}</p>
          <p className="col-span-2"><strong>Notes:</strong> {applicant.notes || "—"}</p>
          <p className="col-span-2">
            <strong>Applied At:</strong> {new Date(applicant.appliedAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={() => {
              toast("Closed applicant details");
              onClose();
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
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
    if (selectedIds.length === 0) {
      toast.error("No students selected!");
      return;
    }
    assignSlot();
    toast.success(`Assigned slots to ${selectedIds.length} students `);
  }

  function handleSelect50() {
    select50();
    toast.success("Selected 50 students");
  }

  function handleClearSelection() {
    clearSelection();
    toast("Selection cleared");
  }

  return (
    <div
      className={`p-6 h-screen overflow-y-auto transition-colors ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Toast System */}
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-6">Applicants</h1>

      {/* Total Counts */}
      <div className="flex gap-4 mb-4 text-lg">
        <span className="font-semibold">Total Students: {totalApplicants}</span>
        <span className="font-semibold text-green-700">Slots Assigned: {totalAssignedSlots}</span>
      </div>

      {/* Slot Assign Controls */}
      <div className="flex gap-3 items-center mb-6 bg-white shadow p-4 rounded-md border flex-wrap">
        <label className="flex items-center gap-2 text-sm">
          Date:
          <input
            type="date"
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Time:
          <input
            type="time"
            step="3600"
            value={slotHour}
            onChange={(e) => setSlotHour(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
        </label>
        <button
          onClick={handleAssignSlot}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 rounded-md text-white font-semibold transition ${
            selectedIds.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Assign Slot ({selectedIds.length})
        </button>

        <button
          onClick={handleSelect50}
          className="ml-auto bg-blue-600 hover:bg-blue-800 text-white font-semibold text-sm px-4 py-2 rounded transition"
        >
          Select 50 Students
        </button>
        <button
          onClick={handleClearSelection}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Clear Selection
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 shadow-sm">
            <tr>
              <th className="px-4 py-2 text-center">Select</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Library ID</th>
              <th className="px-4 py-2 text-left">Slot</th>
              <th className="px-4 py-2 text-right">Actions</th>
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
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </div>
  );
}
