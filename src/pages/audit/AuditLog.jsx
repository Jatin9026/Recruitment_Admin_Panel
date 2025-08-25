import React, { useEffect, useState } from "react";

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Dummy logs until backend is ready
  const dummyLogs = [
    {
      _id: "1",
      user: "Alice",
      action: "Logged in",
      timestamp: new Date().toISOString(),
      ip: "192.168.1.10",
    },
    {
      _id: "2",
      user: "Bob",
      action: "Updated Task Status",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      ip: "192.168.1.20",
    },
    {
      _id: "3",
      user: "Charlie",
      action: "Sent Bulk Mail",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      ip: "192.168.1.30",
    },
  ];

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Simulate backend fetch with delay
      setTimeout(() => {
        setLogs(dummyLogs);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch audit logs");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      new Date(log.timestamp).toLocaleString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by user, action, timestamp..."
          className="p-2 border rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Timestamp</th>
              <th className="p-2 border">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  Loading logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{log.user}</td>
                  <td className="p-2 border">{log.action}</td>
                  <td className="p-2 border">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2 border">{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
