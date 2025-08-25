import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ScreeningEvaluate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const response = await axios.get(`/api/applicants/${id}`);
        setApplicant(response.data);
      } catch (err) {
        console.error("Error fetching applicant:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicant();
  }, [id]);

  const handleSubmit = async () => {
    try {
      await axios.post(`/api/screening/${id}`, {
        assignedDomain: selectedDomain,
        feedback,
      });
      alert("Applicant successfully moved to domain interview!");
      navigate("/screening");
    } catch (err) {
      console.error("Error saving screening:", err);
      alert("Failed to save screening.");
    }
  };

  if (loading) return <p>Loading applicant...</p>;
  if (!applicant) return <p>Applicant not found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Screening Evaluation - {applicant.name}
      </h2>

      <div className="mb-4">
        <p><strong>Library ID:</strong> {applicant.libraryId}</p>
        <p><strong>Department:</strong> {applicant.department}</p>
        <p><strong>Year:</strong> {applicant.year}</p>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Assign Domain:</label>
        <select
          className="border rounded p-2 w-64"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          <option value="">-- Select Domain --</option>
          {applicant.domainChoices?.map((d, idx) => (
            <option key={idx} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Feedback:</label>
        <textarea
          className="border rounded p-2 w-full"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write feedback..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedDomain}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        Submit Evaluation
      </button>
    </div>
  );
};

export default ScreeningEvaluate;
