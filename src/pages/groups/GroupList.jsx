import React, { useState } from "react";
import dummyApplicants from "../../data/dummyApplicants";
import toast, { Toaster } from "react-hot-toast";

export default function ScreeningManager() {
  const [applicants, setApplicants] = useState(dummyApplicants);
  const [query, setQuery] = useState("");
  const [libraryId, setLibraryId] = useState("");
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

  // Move applicant to Screening
  const handleSelect = (id) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Screening" } : a))
    );
    toast.success("Applicant moved to Screening ✅");
  };

  // Directly reject applicant (no confirmation modal)
  const handleReject = (id) => {
    const rejected = applicants.find((a) => a.id === id);
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    toast.error(`${rejected?.name || "Applicant"} has been rejected`);
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-semibold mb-4">Screening Manager</h1>
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
              toast("Filters cleared");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm"
          >
            Clear
          </button>
        </div>
      </div>
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
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
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
    </div>
  );
}
