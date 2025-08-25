import React, { useState } from "react";
import useUIStore from "../../store/uiStore";
import dummyApplicants from "../../data/dummyApplicants";

function ApplicantRow({ applicant, onView, onSelect, isSelected }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(applicant.id)}
          className="w-4 h-4"
        />
      </td>
      <td className="px-4 py-2 font-medium">{applicant.name || "—"}</td>
      <td className="px-4 py-2">{applicant.email || "—"}</td>
      <td className="px-4 py-2">{applicant.department || "—"}</td>
      <td className="px-4 py-2">{applicant.libraryId || "—"}</td>
      <td className="px-4 py-2">
        {applicant.slot?.startAt ? (
          <span className="text-green-700 font-medium">
            {new Date(applicant.slot.startAt).toLocaleString()}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-2 text-right">
        <button
          onClick={() => onView(applicant)}
          className="text-blue-600 hover:underline"
        >
          View
        </button>
      </td>
    </tr>
  );
}

function ApplicantDetailModal({ applicant, onClose }) {
  if (!applicant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Applicant Details</h2>
        <div className="space-y-2">
          <p><strong>Name:</strong> {applicant.name}</p>
          <p><strong>Email:</strong> {applicant.email}</p>
          <p><strong>Phone:</strong> {applicant.phone}</p>
          <p><strong>Department:</strong> {applicant.department}</p>
          <p><strong>Year:</strong> {applicant.year}</p>
          <p><strong>Library ID:</strong> {applicant.libraryId}</p>
          <p><strong>Status:</strong> {applicant.status}</p>
          <p><strong>Group:</strong> {applicant.group || "—"}</p>
          <p><strong>Check-In:</strong> {applicant.checkIn ? "Yes" : "No"}</p>
          <p><strong>Notes:</strong> {applicant.notes}</p>
          <p>
            <strong>Applied At:</strong>{" "}
            {new Date(applicant.appliedAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
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
  const [applicants, setApplicants] = useState(dummyApplicants);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [slotDate, setSlotDate] = useState("");
  const [slotHour, setSlotHour] = useState("");

  // Toggle select applicant (max 15)
  const handleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((sid) => sid !== id);
      } else {
        if (prev.length >= 15) {
          alert("You can select only up to 15 students");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Assign slot to all selected
  const handleAssignToSelected = () => {
    if (!slotDate || !slotHour) {
      alert("Please select both date and time (hour)");
      return;
    }
    const slotDateTime = new Date(`${slotDate}T${slotHour}:00`);
    setApplicants((prev) =>
      prev.map((app) =>
        selectedIds.includes(app.id) ? { ...app, slot: { startAt: slotDateTime } } : app
      )
    );
    setSelectedIds([]);
    setSlotDate("");
    setSlotHour("");
    alert("Slot assigned successfully to selected applicants");
  };

  return (
    <div
      className={`p-6 h-screen overflow-y-auto ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Applicants</h1>

      {/* Slot Assign Controls */}
      <div className="flex gap-3 items-center mb-4">
        <input
          type="date"
          value={slotDate}
          onChange={(e) => setSlotDate(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        />
        <input
          type="time"
          step="3600" // disables minutes
          value={slotHour}
          onChange={(e) => setSlotHour(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        />
        <button
          onClick={handleAssignToSelected}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 rounded text-white ${
            selectedIds.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Assign Slot to Selected ({selectedIds.length})
        </button>
      </div>

      {/* Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
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
                No applicants found.
              </td>
            </tr>
          ) : (
            applicants.map((app) => (
              <ApplicantRow
                key={app.id}
                applicant={app}
                onView={setSelectedApplicant}
                onSelect={handleSelect}
                isSelected={selectedIds.includes(app.id)}
              />
            ))
          )}
        </tbody>
      </table>

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
