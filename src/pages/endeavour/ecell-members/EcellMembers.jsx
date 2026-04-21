import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Search, ShieldX, Users } from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

export default function EcellMembers() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingEmail, setRemovingEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchMembers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");
      const response = await endeavourApiClient.getEcellMembers();
      const list = response?.data?.members || [];
      setMembers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Unable to fetch ecell members");
      setMembers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) {
      return members;
    }

    const query = searchTerm.toLowerCase();
    return members.filter((member) => {
      return (
        member?.name?.toLowerCase().includes(query) ||
        member?.email?.toLowerCase().includes(query) ||
        member?.access_type?.toLowerCase().includes(query) ||
        member?.account_type?.toLowerCase().includes(query) ||
        member?.position?.toLowerCase().includes(query)
      );
    });
  }, [members, searchTerm]);

  const handleRemoveAccess = async (email) => {
    if (!email) {
      return;
    }

    const shouldProceed = window.confirm(`Remove ecell access for ${email}?`);
    if (!shouldProceed) {
      return;
    }

    try {
      setRemovingEmail(email);
      setError("");
      setSuccessMessage("");
      const response = await endeavourApiClient.removeEcellMember(email);
      setSuccessMessage(response?.message || "Ecell member access removed successfully");
      await fetchMembers(false);
    } catch (err) {
      setError(err?.message || "Failed to remove member access");
    } finally {
      setRemovingEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Ecell Members</h1>
            <p className="mt-1 text-sm text-slate-600">Integrated with GET /api/v1/ecell/ecell-members and POST /api/v1/admin/ecell-members/remove</p>
          </div>

          <button
            type="button"
            onClick={() => fetchMembers(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mt-4 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, access type, account type, position"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
          />
        </div>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</div>
      )}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm text-slate-600">Loading members...</p>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Unable to load members</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px]">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Access Type</th>
                    <th className="px-4 py-3">Account Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id || member.email} className="border-t border-slate-200 text-sm text-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-900">{member.name || "-"}</td>
                      <td className="px-4 py-3">{member.email || "-"}</td>
                      <td className="px-4 py-3">{member.access_type || "-"}</td>
                      <td className="px-4 py-3">{member.account_type || "-"}</td>
                      <td className="px-4 py-3">{member.status || "-"}</td>
                      <td className="px-4 py-3">{member.domain || "-"}</td>
                      <td className="px-4 py-3">{member.position || "-"}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={removingEmail === member.email}
                          onClick={() => handleRemoveAccess(member.email)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ShieldX className="h-4 w-4" />
                          {removingEmail === member.email ? "Removing..." : "Remove Access"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
