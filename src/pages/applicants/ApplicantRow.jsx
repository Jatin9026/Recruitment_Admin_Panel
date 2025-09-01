export default function ApplicantRow({ applicant, onView, onSelect, isSelected }) {
  return (
    <tr className="border-b last:border-none odd:bg-gray-50 hover:bg-blue-50 transition-colors">
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(applicant.id)}
          className="w-4 h-4 accent-blue-600 cursor-pointer"
        />
      </td>
      <td className="px-4 py-2 font-medium">{applicant.name || "—"}</td>
      <td className="px-4 py-2">{applicant.email || "—"}</td>
      <td className="px-4 py-2">{applicant.department || "—"}</td>
      <td className="px-4 py-2">{applicant.libraryId || "—"}</td>
      <td className="px-4 py-2">
        {applicant.slot?.startAt ? (
          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
            {new Date(applicant.slot.startAt).toLocaleString()}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Not Assigned</span>
        )}
      </td>
      <td className="px-4 py-2 text-right flex gap-3 justify-end">
        <button
          onClick={() => onView(applicant)}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
        >
          View
        </button>
      </td>
    </tr>
  );
}
