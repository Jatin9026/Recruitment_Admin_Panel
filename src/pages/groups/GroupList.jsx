import React, { useState } from "react";

// Placeholder for dummy data since it was not provided in the snippet
const dummyApplicants = [
  { id: 1, name: "Riya Sharma", email: "riya.sharma@example.com", department: "Computer Science", libraryId: "LIB2025001", status: "Registered" },
  { id: 2, name: "Arjun Mehta", email: "arjun.mehta@example.com", department: "Electronics", libraryId: "LIB2025002", status: "Registered" },
  { id: 3, name: "Priya Singh", email: "priya.singh@example.com", department: "Mechanical", libraryId: "LIB2025003", status: "Registered" },
  { id: 4, name: "Kabir Khan", email: "kabir.khan@example.com", department: "Civil", libraryId: "LIB2025004", status: "Registered" },
  { id: 5, name: "Neha Verma", email: "neha.verma@example.com", department: "Information Technology", libraryId: "LIB2025005", status: "Registered" },
  { id: 6, name: "Aman Gupta", email: "aman.gupta@example.com", department: "Computer Science", libraryId: "LIB2025006", status: "Registered" },
  { id: 7, name: "Ishita Roy", email: "ishita.roy@example.com", department: "Electronics", libraryId: "LIB2025007", status: "Registered" },
  { id: 8, name: "Sahil Khan", email: "sahil.khan@example.com", department: "Mechanical", libraryId: "LIB2025008", status: "Registered" },
  { id: 9, name: "Kritika Jain", email: "kritika.jain@example.com", department: "Civil", libraryId: "LIB2025009", status: "Registered" },
  { id: 10, name: "Rahul Nair", email: "rahul.nair@example.com", department: "Information Technology", libraryId: "LIB2025010", status: "Registered" },
];

// A simple modal to replace window.confirm
function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm animate-fadeIn">
        <h2 className="text-xl font-bold mb-4">Confirmation</h2>
        <p className="text-sm text-gray-700">{message}</p>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScreeningManager() {
  const [applicants, setApplicants] = useState(dummyApplicants);
  const [query, setQuery] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [applicantToReject, setApplicantToReject] = useState(null);

  // Filter applicants, excluding those in "Screening" status
  const filteredApplicants = applicants
    .filter((a) => a.status !== "Screening")
    .filter((a) => {
      const matchesName =
        query === "" || a.name.toLowerCase().includes(query.toLowerCase());
      const matchesId =
        libraryId === "" ||
        a.libraryId.toLowerCase().includes(libraryId.toLowerCase());
      return matchesName && matchesId;
    });

  // Move applicant to Screening (removes from visible list)
  const handleSelect = (id) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "Screening" } : a
      )
    );
  };

  // Prepare for rejection confirmation
  const handleReject = (id) => {
    setApplicantToReject(id);
    setShowRejectModal(true);
  };

  // Execute rejection after confirmation
  const confirmReject = () => {
    setApplicants((prev) => prev.filter((a) => a.id !== applicantToReject));
    setShowRejectModal(false);
    setApplicantToReject(null);
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <h1 className="text-2xl font-semibold mb-4">Screening Manager</h1>

      {/* Search Section */}
      <div className="bg-white shadow p-4 rounded-md border space-y-2">
        <h2 className="text-lg font-semibold mb-2">Search Applicants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Search by Library ID..."
            value={libraryId}
            onChange={(e) => setLibraryId(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              setQuery("");
              setLibraryId("");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white shadow rounded-md border overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 sticky top-0 shadow-sm">
            <tr>
              <th className="p-2 border text-left">Name</th>
              <th className="p-2 border text-left">Branch</th>
              <th className="p-2 border text-left">Library ID</th>
              <th className="p-2 border text-left">Status</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-4">
                  No applicants found.
                </td>
              </tr>
            ) : (
              filteredApplicants.map((student, idx) => (
                <tr
                  key={student.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                >
                  <td className="p-2 border">{student.name}</td>
                  <td className="p-2 border">{student.department}</td>
                  <td className="p-2 border">{student.libraryId}</td>
                  <td className="p-2 border font-medium">
                    {student.status || "Registered"}
                  </td>
                  <td className="p-2 border text-center space-x-2">
                    {student.status !== "Screening" && (
                      <button
                        onClick={() => handleSelect(student.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800 transition text-sm"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(student.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={confirmReject}
        message="Are you sure you want to reject this applicant?"
      />
    </div>
  );
}
