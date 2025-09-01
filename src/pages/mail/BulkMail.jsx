import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const dummyTemplates = [
  { _id: "t1", templateKey: "welcome", subject: "Welcome to the Drive" },
  { _id: "t2", templateKey: "interview", subject: "Interview Schedule" },
  { _id: "t3", templateKey: "rejection", subject: "Application Status Update" },
];

const dummyRecipients = [
  { _id: "u1", name: "Rahul Kumar", email: "rahul@example.com", domain: "Tech" },
  { _id: "u2", name: "Sneha Sharma", email: "sneha@example.com", domain: "Graphics" },
  { _id: "u3", name: "Amit Patel", email: "amit@example.com", domain: "PR" },
  { _id: "u4", name: "Priya Singh", email: "priya@example.com", domain: "Tech" },
  { _id: "u5", name: "Rohan Das", email: "rohan@example.com", domain: "CR" },
  { _id: "u6", name: "Anjali Verma", email: "anjali@example.com", domain: "Graphics" },
];

const BulkMail = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [sentRecipients, setSentRecipients] = useState([]);
  const [filterDomain, setFilterDomain] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setTemplates(dummyTemplates);
      setRecipients(dummyRecipients);
    }, 500);
  }, []);

  const handleRecipientToggle = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectDomain = (domain) => {
    if (domain === "All") {
      if (selectedRecipients.length === recipients.length) {
        setSelectedRecipients([]);
      } else {
        setSelectedRecipients(recipients.map((r) => r._id));
      }
      return;
    }
    const domainStudents = recipients
      .filter((r) => r.domain === domain)
      .map((r) => r._id);
    setSelectedRecipients((prev) => {
      const allSelected = domainStudents.every((id) => prev.includes(id));
      return allSelected
        ? prev.filter((id) => !domainStudents.includes(id))
        : Array.from(new Set([...prev, ...domainStudents]));
    });
  };

  const handleSend = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }
    if (selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }
    try {
      setLoading(true);
      setTimeout(() => {
        setSentRecipients((prev) => [...prev, ...selectedRecipients]);
        toast.success(
          `Emails sent. Template: ${selectedTemplate}, Recipients: ${selectedRecipients.length}`
        );
        setSelectedRecipients([]);
        setSelectedTemplate("");
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Error sending emails");
      setLoading(false);
    }
  };

  const filteredRecipients =
    filterDomain === "All"
      ? recipients
      : [
          ...recipients.filter((r) => r.domain === filterDomain),
          ...recipients.filter((r) => r.domain !== filterDomain),
        ];

  const uniqueDomains = ["All", ...new Set(recipients.map((r) => r.domain))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-3 sm:p-6 lg:p-8 flex flex-col max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Bulk Mail</h1>

      <div className="flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-5">
          <label className="block font-semibold mb-2 text-base sm:text-lg">
            Select Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Select Template --</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.templateKey} - {t.subject}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-5">
          <h2 className="font-semibold text-base sm:text-lg mb-3">Filter / Select by Domain</h2>
          <div className="flex flex-wrap gap-2">
            {uniqueDomains.map((domain) => (
              <button
                key={domain}
                onClick={() => {
                  setFilterDomain(domain);
                  handleSelectDomain(domain);
                }}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                  filterDomain === domain
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 flex-1 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">Student List</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedRecipients.length} selected
          </span>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-sm lg:text-base">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                <th className="p-3">Select</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipients.map((r, idx) => {
                const isSent = sentRecipients.includes(r._id);
                return (
                  <tr
                    key={r._id}
                    className={`${
                      isSent
                        ? "bg-green-50 dark:bg-green-900/40"
                        : idx % 2 === 0
                        ? "bg-gray-50 dark:bg-gray-900/30"
                        : "bg-white dark:bg-gray-800"
                    } border-b border-gray-200 dark:border-gray-700`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(r._id)}
                        onChange={() => handleRecipientToggle(r._id)}
                        disabled={isSent}
                        className="h-5 w-5 accent-blue-600 dark:accent-blue-500"
                      />
                    </td>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {r.email}
                    </td>
                    <td className="p-3">{r.domain}</td>
                    <td className="p-3">
                      {isSent ? (
                        <span className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                          <CheckCircle className="h-5 w-5 mr-1" /> Sent
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 max-h-96 overflow-y-auto">
          {filteredRecipients.map((r) => {
            const isSent = sentRecipients.includes(r._id);
            return (
              <div
                key={r._id}
                className={`border rounded-lg p-4 ${
                  isSent
                    ? "bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(r._id)}
                      onChange={() => handleRecipientToggle(r._id)}
                      disabled={isSent}
                      className="h-5 w-5 accent-blue-600 dark:accent-blue-500 mt-1"
                    />
                    <div>
                      <h3 className="font-semibold text-base">{r.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {r.email}
                      </p>
                    </div>
                  </div>
                  {isSent && (
                    <span className="flex items-center text-green-600 dark:text-green-400 font-semibold text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" /> Sent
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {r.domain}
                  </span>
                  {!isSent && (
                    <span className="text-gray-500 dark:text-gray-400">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={loading}
        className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:max-w-xs sm:mx-auto text-sm sm:text-base"
      >
        {loading ? "Sending..." : "Send Bulk Email"}
      </button>
    </div>
  );
};

export default BulkMail;
