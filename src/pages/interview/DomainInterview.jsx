import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "../../utils/apiConfig";
import toast, { Toaster } from "react-hot-toast";

const DomainInterviewBase = ({ domain }) => {
  const location = useLocation();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingApplicant, setEvaluatingApplicant] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState("");

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    const fetchDomainApplicants = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getApplicants();
        const allApplicants = response.data || [];
        
        // Filter for applicants scheduled for interviews in this domain
        const filtered = allApplicants.filter(
          (a) => a.status === "INTERVIEW_SCHEDULED" && a.assignedDomain === domain
        );
        setApplicants(filtered);
      } catch (error) {
        console.error("Error fetching domain applicants:", error);
        toast.error("Failed to load applicants");
        setApplicants([]);
      } finally {
        setLoading(false);
        
        // Ensure scroll to top after data is loaded
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 100);
      }
    };
    fetchDomainApplicants();
  }, [domain]);

  const handleOpenEvaluation = (applicant) => {
    setEvaluatingApplicant(applicant);
    setFeedback("");
    setDecision("");
  };

  const handleCloseEvaluation = () => setEvaluatingApplicant(null);

  const handleSubmitEvaluation = () => {
    if (!decision) {
      toast.error("Please select either 'Select' or 'Reject'");
      return;
    }
    setApplicants((prev) =>
      prev.filter((a) => a.id !== evaluatingApplicant.id)
    );
    toast.success(
      `${evaluatingApplicant.name} has been ${
        decision === "select" ? "selected " : "rejected "
      }. Feedback saved.`
    );
    setEvaluatingApplicant(null);
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 py-10 text-lg">
        Loading {domain} applicants...
      </p>
    );

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 border-b border-gray-300 pb-3">
        {domain} Domain Interviews
      </h1>

      {applicants.length === 0 ? (
        <p className="text-center text-gray-500 text-base sm:text-lg py-10 sm:py-20 px-4">
          No applicants scheduled for {domain} interviews.
        </p>
      ) : (
        <>
          <div className="hidden md:block overflow-auto rounded-lg shadow-md border border-gray-300 bg-white dark:bg-gray-800">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">Library ID</th>
                  <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">Name</th>
                  <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">Department</th>
                  <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">Year</th>
                  <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">Group</th>
                  <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">Interview Date</th>
                  <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant, idx) => (
                  <tr
                    key={applicant.id}
                    className={`hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                      idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"
                    }`}
                  >
                    <td className="p-3 border-b border-gray-300 dark:border-gray-600">{applicant.libraryId}</td>
                    <td className="p-3 border-b border-gray-300 dark:border-gray-600">{applicant.name}</td>
                    <td className="p-3 border-b border-gray-300 dark:border-gray-600">{applicant.department}</td>
                    <td className="p-3 border-b border-gray-300 dark:border-gray-600">{applicant.year}</td>
                    <td className="p-3 border-b border-gray-300 dark:border-gray-600">{applicant.groupNumber || "-"}</td>
                    <td className="p-3 border-b border-gray-300 dark:border-gray-600">
                      {applicant.interviewDate
                        ? new Date(applicant.interviewDate).toLocaleDateString()
                        : "Not Assigned"}
                    </td>
                    <td className="p-3 border-b border-gray-300 dark:border-gray-600">
                      <button
                        onClick={() => handleOpenEvaluation(applicant)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{applicant.name}</h3>
                  <button
                    onClick={() => handleOpenEvaluation(applicant)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Evaluate
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Library ID:</span>
                    <span>{applicant.libraryId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Department:</span>
                    <span>{applicant.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Year:</span>
                    <span>{applicant.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Group:</span>
                    <span>{applicant.groupNumber || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Interview Date:</span>
                    <span>
                      {applicant.interviewDate
                        ? new Date(applicant.interviewDate).toLocaleDateString()
                        : "Not Assigned"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {evaluatingApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-2 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Evaluate {evaluatingApplicant.name}
            </h3>

            <div className="mb-4">
              <label className="block font-medium mb-2 text-sm sm:text-base">Decision</label>
              <div className="flex gap-4 sm:gap-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="select"
                    checked={decision === "select"}
                    onChange={(e) => setDecision(e.target.value)}
                    className="form-radio text-blue-600 w-4 h-4"
                  />
                  <span className="ml-2 text-sm sm:text-base">Select</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={decision === "reject"}
                    onChange={(e) => setDecision(e.target.value)}
                    className="form-radio text-red-600 w-4 h-4"
                  />
                  <span className="ml-2 text-sm sm:text-base">Reject</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="feedback" className="block font-medium mb-2 text-sm sm:text-base">
                Feedback
              </label>
              <textarea
                id="feedback"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write feedback..."
                className="w-full border rounded-md p-2 sm:p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                onClick={handleCloseEvaluation}
                className="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEvaluation}
                disabled={!decision}
                className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainInterviewBase;
