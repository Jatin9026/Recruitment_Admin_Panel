import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dummyApplicants from "../../data/dummyApplicants";

const PendingScreening = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = () => {
      setTimeout(() => {
        const pending = dummyApplicants.filter(
          (a) => a.status === "Pending Screening"
        );
        setApplicants(pending);
        setLoading(false);
      }, 500);
    };
    fetchPending();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-600 py-10 text-lg">Loading pending screenings...</p>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 border-b border-gray-300 pb-3">
        Pending Screening
      </h1>

      {applicants.length === 0 ? (
        <p className="text-center text-gray-500 text-lg flex-grow flex items-center justify-center">
          No applicants pending screening.
        </p>
      ) : (
        // Scroll container with fixed max height
        <div className="flex-grow overflow-auto rounded-lg shadow border border-gray-300 bg-white dark:bg-gray-800">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">
                  Library ID
                </th>
                <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">
                  Name
                </th>
                <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">
                  Department
                </th>
                <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">
                  Year
                </th>
                <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">
                  Applied At
                </th>
                <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-left">
                  Actions
                </th>
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
                  <td className="p-3 border-b border-gray-300 dark:border-gray-600">
                    {applicant.libraryId}
                  </td>
                  <td className="p-3 border-b border-gray-300 dark:border-gray-600">
                    {applicant.name}
                  </td>
                  <td className="p-3 border-b border-gray-300 dark:border-gray-600">
                    {applicant.department}
                  </td>
                  <td className="p-3 border-b border-gray-300 dark:border-gray-600">
                    {applicant.year}
                  </td>
                  <td className="p-3 border-b border-gray-300 dark:border-gray-600">
                    {new Date(applicant.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b border-gray-300 dark:border-gray-600">
                    <Link
                      to={`/screening/evaluate/${applicant.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Evaluate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default PendingScreening;
