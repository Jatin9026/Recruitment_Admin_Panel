
import React, { useState, useEffect } from "react";
import axios from "axios";

const Setting = () => {
  const [settings, setSettings] = useState({
    siteName: "",
    adminEmail: "",
    notificationEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/settings");
      setSettings(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put("/api/settings", settings);
      setMessage("Settings updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update settings");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">System Settings</h1>

      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded space-y-4">
        <div>
          <label className="block font-medium mb-1">Site Name</label>
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Admin Email</label>
          <input
            type="email"
            name="adminEmail"
            value={settings.adminEmail}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="notificationEnabled"
            checked={settings.notificationEnabled}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label className="font-medium">Enable Notifications</label>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
};

export default Setting;
