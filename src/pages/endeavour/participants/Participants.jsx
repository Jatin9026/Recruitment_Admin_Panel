import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const includeOptions = [
  "team",
  "members",
  "events",
  "rounds",
  "panels",
  "slots",
  "attendance",
  "orders",
];

function ParticipantDetailModal({ isOpen, data, loading, error, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Participant Full Profile</h2>
            <p className="text-xs text-slate-500">GET /api/v1/admin/participants/{'{user_id}'}/full</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-72px)] overflow-y-auto p-5">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
              <p className="mt-2 text-sm text-slate-600">Loading participant details...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-medium">Failed to load participant details</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">User</h3>
                <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <p><span className="font-medium text-slate-900">Name:</span> {data?.user?.name || "-"}</p>
                  <p><span className="font-medium text-slate-900">Email:</span> {data?.user?.email || "-"}</p>
                  <p><span className="font-medium text-slate-900">Phone:</span> {data?.user?.phone || "-"}</p>
                  <p><span className="font-medium text-slate-900">College:</span> {data?.user?.college || "-"}</p>
                  <p><span className="font-medium text-slate-900">Branch:</span> {data?.user?.branch || "-"}</p>
                  <p><span className="font-medium text-slate-900">Year:</span> {data?.user?.year || "-"}</p>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">Summary</h3>
                <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 md:grid-cols-4">
                  <p><span className="font-medium text-slate-900">Teams:</span> {data?.teams?.length || 0}</p>
                  <p><span className="font-medium text-slate-900">Events:</span> {data?.events?.length || 0}</p>
                  <p><span className="font-medium text-slate-900">Attendance:</span> {data?.attendance?.length || 0}</p>
                  <p><span className="font-medium text-slate-900">Orders:</span> {data?.orders?.length || 0}</p>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">Raw Response (for complete nested data)</h3>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EndeavourParticipants() {
  const [participants, setParticipants] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 25, total: 0, has_next: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [activeIncludes, setActiveIncludes] = useState(["team", "events"]);

  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const includeQuery = useMemo(() => activeIncludes.join(","), [activeIncludes]);

  const fetchParticipants = async ({ showLoader = true, page = pagination.page } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");
      const response = await endeavourApiClient.getParticipantsFull({
        page,
        pageSize: pagination.page_size,
        includeInactive,
        include: includeQuery,
      });

      const data = response?.data || {};
      setParticipants(Array.isArray(data?.participants) ? data.participants : []);
      setPagination((prev) => ({
        ...prev,
        ...(data?.pagination || prev),
      }));
    } catch (err) {
      setError(err?.message || "Failed to load participants");
      setParticipants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParticipants({ showLoader: true, page: 1 });
  }, [includeInactive, includeQuery]);

  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) {
      return participants;
    }

    const query = searchTerm.toLowerCase();
    return participants.filter((entry) => {
      const user = entry?.user || {};
      return (
        user?.name?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query) ||
        user?.phone?.toLowerCase().includes(query) ||
        user?.college?.toLowerCase().includes(query)
      );
    });
  }, [participants, searchTerm]);

  const toggleInclude = (section) => {
    setActiveIncludes((prev) => {
      if (prev.includes(section)) {
        return prev.filter((item) => item !== section);
      }
      return [...prev, section];
    });
  };

  const openParticipantDetail = async (userId) => {
    setSelectedParticipantId(userId);
    setDetailData(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await endeavourApiClient.getParticipantFull(userId, includeQuery);
      setDetailData(response?.data || null);
    } catch (err) {
      setDetailError(err?.message || "Failed to load participant profile");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeParticipantDetail = () => {
    setSelectedParticipantId("");
    setDetailData(null);
    setDetailError("");
    setDetailLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Participant Profiles</h1>
            <p className="mt-1 text-sm text-slate-600">Integrated with /api/v1/admin/participants/full and /{`{user_id}`}/full</p>
          </div>

          <button
            type="button"
            onClick={() => fetchParticipants({ showLoader: false })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr,210px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by participant name, email, phone, college"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            />
          </div>

          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Include Inactive
          </label>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Include Sections</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {includeOptions.map((item) => {
              const active = activeIncludes.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInclude(item)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-white text-slate-600 border border-slate-300"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm text-slate-600">Loading participant profiles...</p>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Unable to load participants</p>
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
          {filteredParticipants.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No participants found for the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Teams</th>
                    <th className="px-4 py-3">Events</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((entry) => {
                    const user = entry?.user || {};
                    return (
                      <tr key={user.id} className="border-t border-slate-200 text-sm text-slate-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <UserRound className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="font-medium text-slate-900">{user.name || "-"}</p>
                              <p className="text-xs text-slate-500">{user.role || "participant"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p>{user.email || "-"}</p>
                          <p className="text-xs text-slate-500">{user.phone || "-"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p>{user.college || "-"}</p>
                          <p className="text-xs text-slate-500">{user.branch || "-"}</p>
                        </td>
                        <td className="px-4 py-3">{entry?.teams?.length || 0}</td>
                        <td className="px-4 py-3">{entry?.events?.length || 0}</td>
                        <td className="px-4 py-3">{entry?.attendance?.length || 0}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openParticipantDetail(user.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                            View Full
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <span>
          Page {pagination.page || 1} | Page Size {pagination.page_size || 25} | Total {pagination.total || 0}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchParticipants({ showLoader: false, page: Math.max(1, (pagination.page || 1) - 1) })}
            disabled={(pagination.page || 1) <= 1 || refreshing}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => fetchParticipants({ showLoader: false, page: (pagination.page || 1) + 1 })}
            disabled={!pagination.has_next || refreshing}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <ParticipantDetailModal
        isOpen={Boolean(selectedParticipantId)}
        data={detailData}
        loading={detailLoading}
        error={detailError}
        onClose={closeParticipantDetail}
      />
    </div>
  );
}
