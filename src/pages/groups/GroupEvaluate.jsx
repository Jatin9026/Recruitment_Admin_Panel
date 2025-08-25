import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

const GroupEvaluate = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluationNotes, setEvaluationNotes] = useState({});

  useEffect(() => {
    // Dummy group data (replace with API when backend ready)
    const dummyGroup = {
      id: groupId,
      name: `Group ${groupId}`,
      members: [
        { id: "m1", name: "Ravi Kumar", department: "Tech" },
        { id: "m2", name: "Anjali Sharma", department: "Graphics" },
      ]
    };
    setGroup(dummyGroup);
    setLoading(false);

    // Uncomment for real API
    // const fetchGroup = async () => {
    //   try {
    //     const response = await axios.get(`/api/groups/${groupId}`);
    //     setGroup(response.data);
    //   } catch (err) {
    //     console.error('Failed to fetch group:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchGroup();
  }, [groupId]);

  const handleNoteChange = (memberId, note) => {
    setEvaluationNotes((prev) => ({ ...prev, [memberId]: note }));
  };

  const handleSubmit = async () => {
    // Submit to backend later
    console.log("Submitted notes:", evaluationNotes);
    alert('Evaluation submitted successfully!');
    navigate('/groups/list');
  };

  if (loading) return <p>Loading group details...</p>;
  if (!group) return <p>Group not found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Evaluate {group.name}</h1>
      <table className="min-w-full border border-gray-200 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Member Name</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Evaluation Notes</th>
          </tr>
        </thead>
        <tbody>
          {group.members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="p-2 border">{member.name}</td>
              <td className="p-2 border">{member.department}</td>
              <td className="p-2 border">
                <textarea
                  className="w-full p-1 border rounded"
                  value={evaluationNotes[member.id] || ''}
                  onChange={(e) => handleNoteChange(member.id, e.target.value)}
                  placeholder="Enter notes..."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit Evaluation
      </button>
    </div>
  );
};
export default GroupEvaluate;
