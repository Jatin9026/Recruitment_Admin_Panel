
import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageSlots = ({ role }) => {
  const [applicants, setApplicants] = useState([]);
  const [slots, setSlots] = useState({}); 

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get("/api/applicants"); 
        console.log("API response:", res.data); 
        if (Array.isArray(res.data)) {
          setApplicants(res.data);
        } else if (Array.isArray(res.data.applicants)) {
          setApplicants(res.data.applicants);
        } else {
          setApplicants([]);
        }
      } catch (err) {
        console.error("Error fetching applicants", err);
        setApplicants([]); 
      }
    };
  
    fetchApplicants();
  }, []);
  

  const handleSlotChange = (applicantId, value) => {
    setSlots((prev) => ({ ...prev, [applicantId]: value }));
  };

  const handleSubmit = (applicantId) => {
    const slotValue = slots[applicantId];
    axios
      .post("/api/manage-slots", { applicantId, slot: slotValue })
      .then(() => {
        alert("Slot assigned successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Error assigning slot");
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Interview Slots</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Applicant Name</th>
            <th className="border px-4 py-2">Current Slot</th>
            <th className="border px-4 py-2">Assign/Reschedule</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant.id}>
              <td className="border px-4 py-2">{applicant.name}</td>
              <td className="border px-4 py-2">{applicant.slot || "Not Assigned"}</td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={slots[applicant.id]}
                  onChange={(e) => handleSlotChange(applicant.id, e.target.value)}
                  className="border px-2 py-1 w-full"
                  disabled={
                    applicant.slot && role !== "Super-Admin"
                  } // only Super-Admin can change assigned slot
                />
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                  onClick={() => handleSubmit(applicant.id)}
                  disabled={applicant.slot && role !== "Super-Admin"}
                >
                  {applicant.slot ? "Reschedule" : "Assign"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageSlots;
