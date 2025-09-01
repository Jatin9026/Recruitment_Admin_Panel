import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const MailTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({ templateKey: "", subject: "", body: "" });
  const [loading, setLoading] = useState(false);

  const dummyTemplates = [
    { _id: "1", templateKey: "welcome", subject: "Welcome to Our Drive", body: "Hello {{name}}, welcome!" },
    { _id: "2", templateKey: "interview", subject: "Interview Invitation", body: "Dear {{name}}, your interview is scheduled for {{date}}" },
    { _id: "3", templateKey: "rejection", subject: "Application Status", body: "Hello {{name}}, unfortunately..." },
  ];

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setTemplates(dummyTemplates);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching templates");
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
      const updated = templates.map((t) =>
        t._id === editingTemplate._id ? { ...t, ...form } : t
      );
      setTemplates(updated);
      toast.success("Template updated successfully");
    } else {
      const newTemplate = {
        _id: Date.now().toString(),
        ...form,
      };
      setTemplates([...templates, newTemplate]);
      toast.success("Template created successfully");
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
    setTemplates(templates.filter((t) => t._id !== id));
    toast.success("Template deleted");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-3 sm:p-6 lg:p-8 flex flex-col max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 border-b border-gray-300 dark:border-gray-700 pb-3">
        Mail Templates
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-10">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
          {editingTemplate ? "Edit Template" : "Create Template"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-3xl">
          <div>
            <label className="block font-medium mb-2 text-sm sm:text-base" htmlFor="templateKey">
              Template Key
            </label>
            <input
              id="templateKey"
              type="text"
              name="templateKey"
              value={form.templateKey}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-sm sm:text-base" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-sm sm:text-base" htmlFor="body">
              Body
            </label>
            <textarea
              id="body"
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 sm:p-3 text-sm sm:text-base resize-y focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white sm:rows-6"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition focus:outline-none focus:ring-4 focus:ring-gray-300 text-sm sm:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Existing Templates</h2>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : templates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No templates found.</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
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
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-base mb-1">{template.templateKey}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{template.subject}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default MailTemplate;
