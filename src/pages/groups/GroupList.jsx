import React, { useState } from "react";
import dummyApplicants from "../../data/dummyApplicants";
import toast, { Toaster } from "react-hot-toast";

export default function ScreeningManager() {
  const [applicants, setApplicants] = useState(dummyApplicants);
  const [rejected, setRejected] = useState([]);
  const [query, setQuery] = useState("");
  const [libraryId, setLibraryId] = useState("");

  const filteredApplicants = applicants
    .filter((a) => a.status !== "Screening")
    .filter((a) => !rejected.some((r) => r.id === a.id))
    .filter((a) => {
      const matchesName = query === "" || a.name.toLowerCase().includes(query.toLowerCase());
      const matchesId = libraryId === "" || a.libraryId.toLowerCase().includes(libraryId.toLowerCase());
      return matchesName && matchesId;
    });

  const handleReject = (student) => {
    setRejected((prev) => [...prev, student]);
    toast.error(`${student?.name || "Applicant"} marked as Rejected`);
  };

  const handleUndo = (student) => {
    setRejected((prev) => prev.filter((r) => r.id !== student.id));
    toast.success(`${student?.name || "Applicant"} restored`);
  };

  const handleUpdate = () => {
    setApplicants((prev) =>
      prev.map((a) => (rejected.some((r) => r.id === a.id) ? a : { ...a, status: "Screening" }))
    );
    setApplicants((prev) => prev.filter((a) => !rejected.some((r) => r.id === a.id)));
    toast.success("Updated successfully");
    setRejected([]);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <Toaster position="top-right" />
      <h1 className="text-2xl md:text-3xl font-semibold">Screening Manager</h1>

      <div className="bg-white shadow p-4 rounded-md border space-y-2">
        <h2 className="text-lg font-semibold">Search Applicants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          <input
            type="text"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            placeholder="Search by Library ID..."
            value={libraryId}
            onChange={(e) => setLibraryId(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <button
            onClick={() => {
              setQuery("");
              setLibraryId("");
              toast("Filters cleared");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm w-full sm:w-auto"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-md border h-[520px] overflow-y-auto">
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
                  <td className="p-2 border font-medium">{student.status || "Registered"}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleReject(student)}
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

      <div className="flex justify-end">
        <button
          onClick={handleUpdate}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-800 transition text-sm"
        >
          Update
        </button>
      </div>

      {rejected.length > 0 && (
        <div className="bg-white shadow p-4 rounded-md border">
          <h2 className="text-lg font-semibold mb-2 text-red-600">Rejected Students</h2>
          <div className="space-y-2">
            {rejected.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-2 rounded gap-2"
              >
                <span>
                  {r.name} ({r.libraryId}) - {r.department}
                </span>
                <button
                  onClick={() => handleUndo(r)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition text-sm"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
