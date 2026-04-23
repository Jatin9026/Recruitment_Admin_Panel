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

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
};

function InfoField({ label, value, mono = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-sm text-slate-900 ${mono ? "break-all font-mono" : ""}`}>{value || "-"}</p>
    </div>
  );
}

function ParticipantDetailModal({ isOpen, data, loading, error, onClose }) {
  if (!isOpen) {
    return null;
  }

  const user = data?.user || {};
  const teams = Array.isArray(data?.teams) ? data.teams : [];
  const events = Array.isArray(data?.events) ? data.events : [];
  const topLevelRounds = Array.isArray(data?.rounds) ? data.rounds : [];
  const eventRounds = events.flatMap((eventEntry) => (Array.isArray(eventEntry?.rounds) ? eventEntry.rounds : []));
  const rounds = [...topLevelRounds, ...eventRounds];
  const attendance = Array.isArray(data?.attendance) ? data.attendance : [];
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  const members = Array.isArray(data?.members) ? data.members : [];
  const slots = Array.isArray(data?.slots) ? data.slots : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Participant Full Profile</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{user?.name || "Participant profile"}</h2>
            <p className="mt-1 text-sm text-slate-600">GET /api/v1/admin/participants/{'{user_id}'}/full</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{user?.email || "No email"}</span>
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{teams.length} teams</span>
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{events.length} events</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100"
            aria-label="Close details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
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
            <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
              <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-lg font-semibold text-slate-700">
                    {(user?.name || user?.email || "P").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user?.name || "-"}</p>
                    <p className="text-xs text-slate-500">{user?.email || "No email"}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Phone</p>
                    <p className="mt-1 text-sm text-slate-800">{user?.phone || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">College</p>
                    <p className="mt-1 text-sm text-slate-800">{user?.college || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Branch</p>
                    <p className="mt-1 text-sm text-slate-800">{user?.branch || "-"}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Teams</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{teams.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Events</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{events.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Attendance</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{attendance.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Orders</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{orders.length}</p>
                  </div>
                </div>
              </aside>

              <div className="space-y-4">
                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">User</h3>
                  </div>
                  <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoField label="Name" value={user?.name || "-"} />
                    <InfoField label="Email" value={user?.email || "-"} />
                    <InfoField label="Phone" value={user?.phone || "-"} />
                    <InfoField label="College" value={user?.college || "-"} />
                    <InfoField label="Branch" value={user?.branch || "-"} />
                    <InfoField label="Year" value={user?.year || "-"} />
                  </dl>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Teams</h3>
                  </div>
                  {teams.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {teams.map((teamEntry, index) => {
                        const teamRecord = teamEntry?.team || teamEntry || {};
                        const teamMembers = Array.isArray(teamEntry?.members) ? teamEntry.members : [];

                        return (
                        <div key={teamRecord?.id || `${teamRecord?.name || "team"}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="font-medium text-slate-900">{teamRecord?.name || "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">{teamRecord?.event_id || teamRecord?.id || "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">Members: {teamMembers.length}</p>
                        </div>
                      );})}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Team data was not returned for the current include selection.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Events</h3>
                  </div>
                  {events.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {events.map((eventEntry, index) => {
                        const eventRecord = eventEntry?.event || eventEntry || {};
                        const ticket = eventEntry?.ticket || {};
                        const currentRound = eventEntry?.current_round || {};

                        return (
                        <div key={eventRecord?.id || `${eventRecord?.name || "event"}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="font-medium text-slate-900">{eventRecord?.name || eventRecord?.id || "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">{eventRecord?.category || "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">Registration: {eventEntry?.registration_status || "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">Progression: {eventEntry?.progression_status || "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">Ticket: {ticket?.id || "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">Current Round: {currentRound?.name || "-"}</p>
                        </div>
                      );})}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Event data was not returned for the current include selection.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Rounds</h3>
                  </div>
                  {rounds.length ? (
                    <div className="space-y-3">
                      {rounds.map((entry, index) => {
                        const round = entry?.round || entry || {};
                        const panelList = Array.isArray(entry?.panels) ? entry.panels : [];
                        return (
                          <div key={round?.id || `${round?.name || "round"}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-slate-900">{round?.name || `Round ${index + 1}`}</p>
                              <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700">{round?.mode || "-"}</span>
                            </div>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                              <InfoField label="Sequence" value={round?.sequence || "-"} />
                              <InfoField label="Status" value={round?.status || "-"} />
                              <InfoField label="Starts" value={formatDateTime(round?.starts_at)} />
                              <InfoField label="Ends" value={formatDateTime(round?.ends_at)} />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Panels: {panelList.length}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Round data was not returned for the current include selection.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Attendance</h3>
                  </div>
                  {attendance.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {attendance.map((record, index) => (
                        <div key={record?.id || `${record?.round_id || "attendance"}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <InfoField label="Status" value={record?.status || record?.attendance_status || record?.present || "-"} />
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <InfoField label="Round" value={record?.round_id || record?.round || "-"} mono />
                            <InfoField label="Marked" value={formatDateTime(record?.created_at || record?.marked_at || record?.updated_at)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Attendance data was not returned for the current include selection.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Orders</h3>
                  </div>
                  {orders.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {orders.map((order, index) => (
                        <div key={order?.id || `${order?.razorpay_order_id || "order"}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-slate-900">{order?.event_id || `Order ${index + 1}`}</p>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${order?.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {order?.status || "-"}
                            </span>
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <InfoField label="Amount" value={typeof order?.amount === "number" ? `${order.amount} ${order?.currency || "INR"}` : "-"} />
                            <InfoField label="Payment ID" value={order?.razorpay_payment_id || order?.provider_payment_id || "-"} mono />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Order data was not returned for the current include selection.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Related Members And Slots</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Members</p>
                      <p className="mt-1 text-sm text-slate-900">{members.length || 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Slots</p>
                      <p className="mt-1 text-sm text-slate-900">{slots.length || 0}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Some blocks are query-dependent. Empty sections mean the API did not return that include for this request.</p>
                </section>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white/90 px-6 py-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Close
            </button>
          </div>
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
  const [includeActive, setIncludeActive] = useState(false);
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
        includeInactive: !includeActive,
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
  }, [includeActive, includeQuery]);

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
              checked={includeActive}
              onChange={(event) => setIncludeActive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Include Active
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
