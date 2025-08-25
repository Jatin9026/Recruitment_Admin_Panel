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

  if (loading) return <p>Loading pending screenings...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Pending Screening</h1>
      {applicants.length === 0 ? (
        <p>No applicants pending screening.</p>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Library ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Year</th>
              <th className="p-2 border">Applied At</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-gray-50">
                <td className="p-2 border">{applicant.libraryId}</td>
                <td className="p-2 border">{applicant.name}</td>
                <td className="p-2 border">{applicant.department}</td>
                <td className="p-2 border">{applicant.year}</td>
                <td className="p-2 border">
                  {new Date(applicant.appliedAt).toLocaleDateString()}
                </td>
                <td className="p-2 border">
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
      )}
    </div>
  );
};

export default PendingScreening;
