import React, { useState } from "react";

const dummyApplicantsData = [
  {
    id: 1, name: "Alice", email: "alice@example.com", status: "Scheduled", slot: { id: 101 },
  },
  {
    id: 2, name: "Bob", email: "bob@example.com", status: "Scheduled", slot: { id: 102 },
  },
  {
    id: 3, name: "Charlie", email: "charlie@example.com", status: "Pending", slot: null,
  },
];

const dummySlots = [
  {
    id: 101, startAt: Date.now() + 1000000, room: "A",
  },
  {
    id: 102, startAt: Date.now() + 2000000, room: "B",
  },
  {
    id: 103, startAt: Date.now() + 3000000, room: "C",
  },
];

const ManageSlots = ({ role }) => {
  const [applicants, setApplicants] = useState(dummyApplicantsData);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [assignMessage, setAssignMessage] = useState("");

  const handleAssign = (applicantId, slotId) => {
    const slot = dummySlots.find((s) => s.id === parseInt(slotId));
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicantId ? { ...a, slot, status: "Scheduled" } : a
      )
    );
    setAssignMessage(`Assigned slot ${slotId} to applicant ${applicantId}`);
    setTimeout(() => setAssignMessage(""), 3000);
  };

  const getApplicantsForSlot = (slotId) =>
    applicants.filter((a) => a.slot?.id === slotId);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 md:mb-6">Manage Slots</h1>
      {assignMessage && (
        <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 text-center">
          {assignMessage}
        </div>
      )}

      <div className="space-y-4">
        {dummySlots.map((slot) => {
          const assignedApplicants = getApplicantsForSlot(slot.id);
          const isOpen = expandedSlot === slot.id;

          return (
            <div
              key={slot.id}
              className="border rounded-lg shadow-sm bg-white"
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedSlot(isOpen ? null : slot.id)}
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {new Date(slot.startAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Room: {slot.room}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
                    {assignedApplicants.length} Students
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="p-4 border-t bg-gray-50">
                  {assignedApplicants.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-max">
                        <thead>
                          <tr className="bg-blue-100 text-blue-800">
                            <th className="px-3 py-2 text-left">ID</th>
                            <th className="px-3 py-2 text-left">Name</th>
                            <th className="px-3 py-2 text-left">Email</th>
                            <th className="px-3 py-2 text-left">Status</th>
                            <th className="px-3 py-2 text-left">Reschedule</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedApplicants.map((a) => (
                            <tr
                              key={a.id}
                              className="hover:bg-white border-b"
                            >
                              <td className="px-3 py-2">{a.id}</td>
                              <td className="px-3 py-2">{a.name}</td>
                              <td className="px-3 py-2">{a.email}</td>
                              <td className="px-3 py-2">{a.status}</td>
                              <td className="px-3 py-2">
                                <select
                                  onChange={(e) =>
                                    handleAssign(a.id, e.target.value)
                                  }
                                  defaultValue={a.slot?.id || ""}
                                  className="border rounded px-2 py-1 w-full"
                                  disabled={a.slot && role !== "Super-Admin"}
                                >
                                  <option value="">-- Change Slot --</option>
                                  {dummySlots.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {new Date(s.startAt).toLocaleString()} (
                                      Room {s.room})
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No students assigned yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageSlots;
