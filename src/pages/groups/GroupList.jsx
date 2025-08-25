import React, { useState } from "react";
import { Link } from "react-router-dom";
import dummyApplicants from "../../data/dummyApplicants"; // your applicants data

const GroupAllocation = () => {
  const [applicants, setApplicants] = useState(dummyApplicants);
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState([]);

  // Handle selecting/deselecting a student
  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((sid) => sid !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // Automatically create group when 10 students are selected
  const handleCreateGroup = () => {
    if (selected.length !== 10) {
      alert("Please select exactly 10 students to form a group.");
      return;
    }

    const newGroupId = `Group-${groups.length + 1}`;
    const groupMembers = applicants.filter((a) => selected.includes(a.id));

    // Update applicants list with assigned group
    const updatedApplicants = applicants.map((a) =>
      selected.includes(a.id) ? { ...a, group: newGroupId } : a
    );

    // New group object
    const newGroup = {
      id: newGroupId,
      name: newGroupId,
      members: groupMembers,
    };

    setGroups([...groups, newGroup]);
    setApplicants(updatedApplicants);
    setSelected([]); // reset selection for next group
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Group Allocation</h1>

      {/* Applicants Table */}
      <table className="min-w-full border border-gray-200 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Branch</th>
            <th className="p-2 border">Library ID</th>
            <th className="p-2 border">Group</th>
            <th className="p-2 border">Select</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="p-2 border">{student.name}</td>
              <td className="p-2 border">{student.department}</td>
              <td className="p-2 border">{student.libraryId}</td>
              <td className="p-2 border">{student.group || "-"}</td>
              <td className="p-2 border">
                <input
                  type="checkbox"
                  disabled={!!student.group} // disable if already grouped
                  checked={selected.includes(student.id)}
                  onChange={() => handleSelect(student.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Button to Create Group */}
      <button
        onClick={handleCreateGroup}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={selected.length !== 10} // only enable when 10 students selected
      >
        Create Group
      </button>

      {/* Groups Section */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Groups</h2>
      {groups.length === 0 ? (
        <p>No groups formed yet.</p>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Group Name</th>
              <th className="p-2 border">Members</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="hover:bg-gray-50">
                <td className="p-2 border">{group.name}</td>
                <td className="p-2 border">
                  <details>
                    <summary className="cursor-pointer text-blue-600">
                      View Members
                    </summary>
                    <ul className="list-disc ml-6">
                      {group.members.map((m) => (
                        <li key={m.id}>
                          {m.name} ({m.department})
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
                <td className="p-2 border">
                  <Link
                    to={`/groups/evaluate/${group.id}`}
                    className="text-green-600 hover:underline"
                  >
                    Evaluate
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GroupAllocation;
