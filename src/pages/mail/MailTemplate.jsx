import React, { useEffect, useState } from "react";

const MailTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({ templateKey: "", subject: "", body: "" });
  const [loading, setLoading] = useState(false);

  // Dummy Data
  const dummyTemplates = [
    { _id: "1", templateKey: "welcome", subject: "Welcome to Our Drive", body: "Hello {{name}}, welcome!" },
    { _id: "2", templateKey: "interview", subject: "Interview Invitation", body: "Dear {{name}}, your interview is scheduled for {{date}}" },
    { _id: "3", templateKey: "rejection", subject: "Application Status", body: "Hello {{name}}, unfortunately..." },
  ];

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // simulate backend call
      setTimeout(() => {
        setTemplates(dummyTemplates);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      alert("Error fetching templates");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTemplate) {
      // Simulate Update
      const updated = templates.map((t) =>
        t._id === editingTemplate._id ? { ...t, ...form } : t
      );
      setTemplates(updated);
      alert("✅ Template updated successfully");
    } else {
      // Simulate Create
      const newTemplate = {
        _id: Date.now().toString(),
        ...form,
      };
      setTemplates([...templates, newTemplate]);
      alert("✅ Template created successfully");
    }

    setForm({ templateKey: "", subject: "", body: "" });
    setEditingTemplate(null);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setForm({
      templateKey: template.templateKey,
      subject: template.subject,
      body: template.body,
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    setTemplates(templates.filter((t) => t._id !== id));
    alert("🗑️ Template deleted");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 flex flex-col max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 border-b border-gray-300 dark:border-gray-700 pb-3">
        Mail Templates
      </h1>

      {/* Form Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-6">
          {editingTemplate ? "Edit Template" : "Create Template"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <div>
            <label className="block font-medium mb-2" htmlFor="templateKey">
              Template Key
            </label>
            <input
              id="templateKey"
              type="text"
              name="templateKey"
              value={form.templateKey}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="body">
              Body
            </label>
            <textarea
              id="body"
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={6}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-base resize-y focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingTemplate ? "Update Template" : "Create Template"}
            </button>

            {editingTemplate && (
              <button
                type="button"
                onClick={() => {
                  setEditingTemplate(null);
                  setForm({ templateKey: "", subject: "", body: "" });
                }}
                className="px-6 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition focus:outline-none focus:ring-4 focus:ring-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Template List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-6">Existing Templates</h2>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : templates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No templates found.</p>
        ) : (
          <table className="w-full table-auto border border-gray-300 dark:border-gray-600 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border px-4 py-2 text-left">Key</th>
                <th className="border px-4 py-2 text-left">Subject</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  key={template._id}
                  className="even:bg-gray-50 dark:even:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition"
                >
                  <td className="border px-4 py-2">{template.templateKey}</td>
                  <td className="border px-4 py-2">{template.subject}</td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MailTemplate;
