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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mail Templates</h1>

      {/* Form */}
      <div className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-2">
          {editingTemplate ? "Edit Template" : "Create Template"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Template Key</label>
            <input
              type="text"
              name="templateKey"
              value={form.templateKey}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Body</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 h-32"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
              className="ml-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Template List */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Existing Templates</h2>
        {loading ? (
          <p>Loading...</p>
        ) : templates.length === 0 ? (
          <p>No templates found.</p>
        ) : (
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Key</th>
                <th className="border px-2 py-1">Subject</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template._id}>
                  <td className="border px-2 py-1">{template.templateKey}</td>
                  <td className="border px-2 py-1">{template.subject}</td>
                  <td className="border px-2 py-1 space-x-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
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
