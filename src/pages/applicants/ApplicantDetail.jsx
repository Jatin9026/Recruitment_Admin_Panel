import React from "react";
import { hasPermission } from "../../utils/roleUtil";
import useUIStore from "../../store/uiStore";

// Heroicons
import { UserIcon, CalendarIcon, ClipboardDocumentListIcon, ClockIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

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
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
        colorMap[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function Timeline({ history }) {
  return (
    <ol className="relative border-l border-gray-300 ml-3">
      {history.map((event, idx) => (
        <li key={idx} className="mb-6 ml-3">
          <div className="flex items-center mb-1">
            <span className="absolute -left-1.5 h-3 w-3 bg-blue-500 rounded-full"></span>
            <p className="text-sm font-semibold">{event.status}</p>
          </div>
          <p className="text-xs text-gray-500">
            {new Date(event.at).toLocaleString()}
          </p>
          {event.remark && (
            <p className="text-sm text-gray-700 italic mt-1">{event.remark}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function ApplicantDetail({ applicant, history, roleLevel }) {
  const { theme } = useUIStore();

  return (
    <div
      className={`min-h-screen p-8 transition-colors ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Heading */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applicant Detail</h1>
          <p className="text-gray-500 text-sm">ID: {applicant.id}</p>
        </div>
        <a
          href="/applicants/list"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Applicants
        </a>
      </header>

      {/* Personal Info */}
      <section className="mb-6 bg-white rounded-lg shadow p-6 border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-blue-600" /> Personal Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="font-semibold">Name:</span> {applicant.personalInfo?.name}</p>
          <p><span className="font-semibold">Email:</span> {applicant.personalInfo?.email}</p>
          <p><span className="font-semibold">Phone:</span> {applicant.personalInfo?.phone}</p>
          <p><span className="font-semibold">College:</span> {applicant.personalInfo?.college}</p>
        </div>
      </section>

      {/* Slot Info */}
      <section className="mb-6 bg-white rounded-lg shadow p-6 border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-green-600" /> Slot
        </h2>
        {applicant.slot ? (
          <p className="text-sm">
            {new Date(applicant.slot.startAt).toLocaleString()} – Room{" "}
            <span className="font-medium">{applicant.slot.room}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500">No slot assigned</p>
        )}

        {hasPermission(roleLevel, "SUPER") && (
          <form
            method="post"
            action={`/applicants/${applicant.id}/slot`}
            className="mt-4"
          >
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
            >
              Reschedule Slot
            </button>
          </form>
        )}
      </section>

      {/* Status */}
      <section className="mb-6 bg-white rounded-lg shadow p-6 border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-600" /> Status
        </h2>
        <StatusBadge status={applicant.status} />
      </section>

      {/* Timeline */}
      <section className="mb-6 bg-white rounded-lg shadow p-6 border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-yellow-600" /> Journey Timeline
        </h2>
        {history && history.length > 0 ? (
          <Timeline history={history} />
        ) : (
          <p className="text-gray-500 text-sm">No events recorded yet.</p>
        )}
      </section>

      {/* Admin Actions */}
      {hasPermission(roleLevel, "ADMIN") && (
        <section className="mb-6 bg-white rounded-lg shadow p-6 border">
          <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
          <form
            method="post"
            action={`/applicants/${applicant.id}/edit`}
            className="space-y-3"
          >
            <label className="block">
              <span className="font-semibold">Notes:</span>
              <textarea
                name="notes"
                defaultValue={applicant.notes}
                className="border w-full p-2 rounded mt-1 text-sm"
              ></textarea>
            </label>
            <button
              type="submit"
              className="bg-yellow-600 text-white px-5 py-2 rounded-md hover:bg-yellow-700 transition"
            >
              Save Changes
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
