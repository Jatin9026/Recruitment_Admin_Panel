import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Search, Users as UsersIcon } from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

export default function EndeavourUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");
      const response = await endeavourApiClient.getUsers();
      setUsers(Array.isArray(response?.users) ? response.users : []);
    } catch (err) {
      setError(err?.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }

    const query = searchTerm.toLowerCase();
    return users.filter((user) => {
      return (
        user?.name?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query) ||
        user?.phone?.toLowerCase().includes(query) ||
        user?.college?.toLowerCase().includes(query) ||
        user?.branch?.toLowerCase().includes(query)
      );
    });
  }, [users, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Registered Users</h1>
            <p className="mt-1 text-sm text-slate-600">Integrated with GET /api/v1/admin/users</p>
          </div>

          <button
            type="button"
            onClick={() => fetchUsers(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr,200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, phone, college, branch"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            Showing <span className="font-semibold">{filteredUsers.length}</span> of {users.length}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm text-slate-600">Loading users...</p>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Unable to load users</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No users match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-slate-200 text-sm text-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-900">{user.name || "-"}</td>
                      <td className="px-4 py-3">{user.email || "-"}</td>
                      <td className="px-4 py-3">{user.phone || "-"}</td>
                      <td className="px-4 py-3">{user.college || "-"}</td>
                      <td className="px-4 py-3">{user.branch || "-"}</td>
                      <td className="px-4 py-3">{user.year || "-"}</td>
                      <td className="px-4 py-3">{user.role || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.is_verified
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {user.is_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
