import React, { useState } from "react";
import dummyApplicants from "../../data/dummyApplicants";
import dummySlots from "../../data/dummySlots";

const ManageSlots = ({ role }) => {
  const [applicants, setApplicants] = useState(dummyApplicants);

  const handleAssign = (applicantId, slotId) => {
    const slot = dummySlots.find((s) => s.id === slotId);
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicantId ? { ...a, slot } : a
      )
    );
    alert(`Assigned slot ${slotId} to applicant ${applicantId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Slots</h1>
      <div className="overflow-x-auto shadow rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Current Slot</th>
              <th className="px-4 py-2">Assign/Reschedule</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{a.id}</td>
                <td className="px-4 py-2">{a.name}</td>
                <td className="px-4 py-2">{a.status}</td>
                <td className="px-4 py-2">
                  {a.slot ? new Date(a.slot.startAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-2">
                  <select
                    onChange={(e) => handleAssign(a.id, e.target.value)}
                    defaultValue=""
                    className="border rounded px-2 py-1"
                    disabled={a.slot && role !== "Super-Admin"}
                  >
                    <option value="">-- Select Slot --</option>
                    {dummySlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {new Date(s.startAt).toLocaleString()} (Room {s.room})
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ManageSlots;
