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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading applicant...</p>
      </div>
    );
  if (!applicant)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">Applicant not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 flex flex-col">
      <div className="max-w-4xl w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold mb-6 border-b border-gray-300 dark:border-gray-700 pb-3">
          Screening Evaluation - {applicant.name}
        </h2>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="mb-2 font-medium">Library ID</p>
            <p className="text-gray-700 dark:text-gray-300">{applicant.libraryId}</p>
          </div>
          <div>
            <p className="mb-2 font-medium">Department</p>
            <p className="text-gray-700 dark:text-gray-300">{applicant.department}</p>
          </div>
          <div>
            <p className="mb-2 font-medium">Year</p>
            <p className="text-gray-700 dark:text-gray-300">{applicant.year}</p>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="domain"
            className="block font-medium mb-2"
          >
            Assign Domain
          </label>
          <select
            id="domain"
            className="border rounded-md p-3 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            <option value="">-- Select Domain --</option>
            {applicant.domainChoices?.map((d, idx) => (
              <option key={idx} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8">
          <label
            htmlFor="feedback"
            className="block font-medium mb-2"
          >
            Feedback
          </label>
          <textarea
            id="feedback"
            className="border rounded-md p-3 w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
            placeholder="Write feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedDomain}
          className={`bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-800 transition focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          Submit Evaluation
        </button>
      </div>
    </div>
  );
};

export default ScreeningEvaluate;
