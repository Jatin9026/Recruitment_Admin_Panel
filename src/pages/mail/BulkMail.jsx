import React, { useEffect, useState } from "react";

const BulkMail = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dummy Templates
  const dummyTemplates = [
    { _id: "t1", templateKey: "welcome", subject: "Welcome to the Drive" },
    { _id: "t2", templateKey: "interview", subject: "Interview Schedule" },
    { _id: "t3", templateKey: "rejection", subject: "Application Status Update" },
  ];

  // Dummy Recipients
  const dummyRecipients = [
    { _id: "u1", name: "Rahul Kumar", email: "rahul@example.com" },
    { _id: "u2", name: "Sneha Sharma", email: "sneha@example.com" },
    { _id: "u3", name: "Amit Patel", email: "amit@example.com" },
    { _id: "u4", name: "Priya Singh", email: "priya@example.com" },
  ];

  useEffect(() => {
    // simulate API call delay
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

  const handleSend = async () => {
    if (!selectedTemplate) return alert("Please select a template");
    if (selectedRecipients.length === 0)
      return alert("Please select at least one recipient");

    try {
      setLoading(true);
      // Simulate sending emails delay
      setTimeout(() => {
        alert(
          `✅ Emails sent!\nTemplate: ${selectedTemplate}\nRecipients: ${selectedRecipients.length}`
        );
        setSelectedRecipients([]);
        setSelectedTemplate("");
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Error sending emails");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 flex flex-col max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 border-b border-gray-300 dark:border-gray-700 pb-4">
        Bulk Mail
      </h1>

      {/* Template Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 max-w-lg w-full">
        <label className="block font-semibold mb-3 text-lg">
          Select Template
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">-- Select Template --</option>
          {templates.map((t) => (
            <option key={t._id} value={t._id}>
              {t.templateKey} - {t.subject}
            </option>
          ))}
        </select>
      </div>

      {/* Recipients List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-10 max-w-3xl w-full">
        <h2 className="text-xl font-semibold mb-4">Select Recipients</h2>
        <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 space-y-2">
          {recipients.map((r) => (
            <label
              key={r._id}
              className="flex items-center cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedRecipients.includes(r._id)}
                onChange={() => handleRecipientToggle(r._id)}
                className="mr-3 h-5 w-5 accent-blue-600 dark:accent-blue-500"
              />
              <span>
                <span className="font-medium">{r.name}</span>{" "}
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  ({r.email})
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed max-w-xs w-full"
      >
        {loading ? "Sending..." : "Send Bulk Email"}
      </button>
    </div>
  );
};

export default BulkMail;
