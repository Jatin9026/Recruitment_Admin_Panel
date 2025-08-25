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
      // Instead of API call, just simulate sending
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Bulk Mail</h1>

      {/* Template Selector */}
      <div className="mb-4 p-4 bg-white shadow rounded">
        <label className="block font-medium mb-2">Select Template</label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
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
      <div className="mb-4 p-4 bg-white shadow rounded">
        <h2 className="font-semibold mb-2">Select Recipients</h2>
        <div className="max-h-64 overflow-y-auto border rounded p-2">
          {recipients.map((r) => (
            <label key={r._id} className="block mb-1">
              <input
                type="checkbox"
                checked={selectedRecipients.includes(r._id)}
                onChange={() => handleRecipientToggle(r._id)}
                className="mr-2"
              />
              {r.name} ({r.email})
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {loading ? "Sending..." : "Send Bulk Email"}
      </button>
    </div>
  );
};

export default BulkMail;
