import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ScreeningEvaluate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain1, setSelectedDomain1] = useState("");
  const [selectedDomain2, setSelectedDomain2] = useState("");
  const [feedback, setFeedback] = useState("");

  const predefinedDomains = ["Tech", "CR", "PR", "Events", "Graphic"];

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const response = await axios.get(`/api/applicants/${id}`);
        setApplicant(response.data);
      } catch (err) {
        console.error("Error fetching applicant:", err);
        toast.error("Failed to load applicant.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplicant();
  }, [id]);

  const handleSubmit = async () => {
    try {
      await axios.post(`/api/screening/${id}`, {
        assignedDomain: selectedDomain1 || selectedDomain2,
        feedback,
      });
      toast.success("Applicant successfully moved to domain interview.");
      navigate("/screening");
    } catch (err) {
      console.error("Error saving screening:", err);
      toast.error("Failed to save screening.");
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
    <div className="min-h-screen bg-white dark:from-gray-900 dark:to-gray-800 p-8 flex flex-col">
      <div className="max-w-4xl w-full mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-6 border-b border-gray-300 dark:border-gray-700 pb-3 text-blue-600 dark:text-blue-400">
          Screening Evaluation - {applicant.name}
        </h2>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">Library ID</p>
            <p className="text-gray-600 dark:text-gray-300">{applicant.libraryId}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">Department</p>
            <p className="text-gray-600 dark:text-gray-300">{applicant.department}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">Year</p>
            <p className="text-gray-600 dark:text-gray-300">{applicant.year}</p>
          </div>
        </div>

        <div className="mb-8">
          <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Assign Domains
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              id="domain-1"
              className="border rounded-md p-3 w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={selectedDomain1}
              onChange={(e) => setSelectedDomain1(e.target.value)}
            >
              <option value="">-- Select Domain 1 --</option>
              {predefinedDomains.map((d, idx) => (
                <option key={idx} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              id="domain-2"
              className="border rounded-md p-3 w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={selectedDomain2}
              onChange={(e) => setSelectedDomain2(e.target.value)}
            >
              <option value="">-- Select Domain 2 --</option>
              {predefinedDomains.map((d, idx) => (
                <option key={idx} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-8">
          <label htmlFor="feedback" className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Feedback
          </label>
          <textarea
            id="feedback"
            className="border rounded-md p-3 w-full h-32 resize-none bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Write feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedDomain1 && !selectedDomain2}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Submit Evaluation
        </button>
      </div>
    </div>
  );
};

export default ScreeningEvaluate;
