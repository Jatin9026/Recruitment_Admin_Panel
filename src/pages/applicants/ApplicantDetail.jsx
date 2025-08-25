
import React from "react";
import { hasPermission } from "../../utils/roleUtil";
import useUIStore from "../../store/uiStore";

function StatusBadge({ status }) {
  const colorMap = {
    REGISTERED: "bg-gray-200 text-gray-800",
    SCHEDULED: "bg-blue-100 text-blue-700",
    PRESENT: "bg-indigo-100 text-indigo-700",
    GD_IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    GD_ELIMINATED: "bg-red-100 text-red-700",
    GD_PASSED: "bg-green-100 text-green-700",
    SCREENED: "bg-purple-100 text-purple-700",
    INTERVIEW_IN_PROGRESS: "bg-orange-100 text-orange-700",
    INTERVIEW_FAILED: "bg-red-100 text-red-700",
    INTERVIEW_PASSED: "bg-green-100 text-green-700",
    TASK_SENT: "bg-cyan-100 text-cyan-700",
    TASK_SUBMITTED: "bg-cyan-200 text-cyan-800",
    SELECTED: "bg-green-200 text-green-800",
    REJECTED: "bg-red-200 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function Timeline({ history }) {
  return (
    <ol className="border-l border-gray-300 ml-4">
      {history.map((event, idx) => (
        <li key={idx} className="mb-4 ml-2">
          <div className="flex items-center mb-1">
            <span className="h-3 w-3 bg-blue-500 rounded-full mr-2"></span>
            <p className="text-sm font-semibold">{event.status}</p>
          </div>
          <p className="text-xs text-gray-600">{new Date(event.at).toLocaleString()}</p>
          {event.remark && <p className="text-sm italic">{event.remark}</p>}
        </li>
      ))}
    </ol>
  );
}

export default function ApplicantDetail({ applicant, history, roleLevel }) {
  const { theme } = useUIStore();

  return (
    <div className={`p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white"}`}>
      <h1 className="text-2xl font-bold mb-2">Applicant Detail</h1>
      <p className="text-gray-600 mb-6">ID: {applicant.id}</p>

      {/* Personal Info */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Name:</strong> {applicant.personalInfo?.name}</p>
          <p><strong>Email:</strong> {applicant.personalInfo?.email}</p>
          <p><strong>Phone:</strong> {applicant.personalInfo?.phone}</p>
          <p><strong>College:</strong> {applicant.personalInfo?.college}</p>
        </div>
      </section>

      {/* Slot Info */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Slot</h2>
        {applicant.slot ? (
          <p>
            {new Date(applicant.slot.startAt).toLocaleString()} – Room {applicant.slot.room}
          </p>
        ) : (
          <p className="text-gray-500">No slot assigned</p>
        )}

        {hasPermission(roleLevel, "SUPER") && (
          <form method="post" action={`/applicants/${applicant.id}/slot`} className="mt-2">
            <button type="submit" className="bg-purple-600 text-white px-3 py-1 rounded">
              Reschedule Slot
            </button>
          </form>
        )}
      </section>


      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Status</h2>
        <StatusBadge status={applicant.status} />
      </section>

      {/* Timeline */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Journey Timeline</h2>
        {history && history.length > 0 ? (
          <Timeline history={history} />
        ) : (
          <p className="text-gray-500">No events recorded yet.</p>
        )}
      </section>
      {/* Admin-only editable fields */}
      {hasPermission(roleLevel, "ADMIN") && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Admin Actions</h2>
          <form method="post" action={`/applicants/${applicant.id}/edit`} className="space-y-2">
            <label className="block">
              Notes:
              <textarea name="notes" defaultValue={applicant.notes} className="border w-full p-2 rounded"></textarea>
            </label>
            <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">
              Save Changes
            </button>
          </form>
        </section>
      )}

      {/* Back link */}
      <div className="mt-8">
        <a href="/applicants/list" className="text-blue-600 hover:underline">← Back to Applicants</a>
      </div>
    </div>
  );
}