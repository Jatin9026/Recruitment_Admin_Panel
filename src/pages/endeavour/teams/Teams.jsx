import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  UsersRound,
  User,
  X,
} from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const includeOptions = ["members", "events", "rounds", "panels", "slots", "attendance", "orders"];

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

const getTeamStats = (data) => {
  const rounds = Array.isArray(data?.rounds) ? data.rounds : [];
  const panels = rounds.reduce((count, entry) => count + (Array.isArray(entry?.panels) ? entry.panels.length : 0), 0);

  return {
    members: Array.isArray(data?.members) ? data.members.length : 0,
    rounds: rounds.length,
    panels,
    attendance: Array.isArray(data?.attendance) ? data.attendance.length : 0,
    orders: Array.isArray(data?.orders) ? data.orders.length : 0,
  };
};

const getPrimaryLabel = (entry, fallbacks = []) => {
  for (const key of fallbacks) {
    const value = entry?.[key];
    if (value) {
      return value;
    }
  }
  return "-";
};

function DetailSection({ title, subtitle, children, muted = false }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200/80 bg-slate-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">{title}</h3>
            {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      <div className={muted ? "bg-slate-50 px-5 py-5" : "px-5 py-5"}>{children}</div>
    </section>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-2/3 rounded-full bg-slate-900/80" />
      </div>
    </div>
  );
}

function InfoField({ label, value, dark = false, mono = false }) {
  const wrapperClass = dark
    ? "border-white/10 bg-white/8 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]"
    : "border-slate-200 bg-slate-50";
  const labelClass = dark ? "text-slate-300" : "text-slate-500";
  const valueClass = dark ? "text-white" : "text-slate-900";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${wrapperClass}`}>
      <p className={`text-[11px] font-medium uppercase tracking-[0.22em] ${labelClass}`}>{label}</p>
      <p className={`mt-2 text-sm font-medium ${valueClass} ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function TeamDetailModal({ isOpen, data, loading, error, onClose }) {
  if (!isOpen) {
    return null;
  }

  const team = data?.team || {};
  const event = data?.event || null;
  const members = Array.isArray(data?.members) ? data.members : [];
  const rounds = Array.isArray(data?.rounds) ? data.rounds : [];
  const attendance = Array.isArray(data?.attendance) ? data.attendance : [];
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  const slots = Array.isArray(data?.slots) ? data.slots : [];
  const stats = getTeamStats(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Team Full Profile</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{team?.name || "Team profile"}</h2>
            <p className="mt-1 text-sm text-slate-600">GET /api/v1/admin/teams/{'{team_id}'}/full</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{team?.invite_code || "Invite code unavailable"}</span>
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{event?.name || team?.event_id || "Event unavailable"}</span>
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{members.length} members</span>
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
              <p className="mt-2 text-sm text-slate-600">Loading team details...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-medium">Failed to load team details</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
              <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-lg font-semibold text-slate-700">
                    {(team?.name || team?.invite_code || "T").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{team?.name || "-"}</p>
                    <p className="text-xs text-slate-500">{team?.invite_code || "No invite code"}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Leader ID</p>
                    <p className="mt-1 break-all text-sm text-slate-800">{team?.leader_id || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Event ID</p>
                    <p className="mt-1 break-all text-sm text-slate-800">{team?.event_id || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Created</p>
                    <p className="mt-1 text-sm text-slate-800">{formatDateTime(team?.created_at)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Members</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{stats.members}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Rounds</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{stats.rounds}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Panels</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{stats.panels}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Orders</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{stats.orders}</p>
                  </div>
                </div>
              </aside>

              <div className="space-y-4">
                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <UsersRound className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Team Core</h3>
                  </div>
                  <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</dt>
                      <dd className="mt-1 text-sm text-slate-900">{team?.name || "-"}</dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Invite Code</dt>
                      <dd className="mt-1 break-all text-sm text-slate-900">{team?.invite_code || "-"}</dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Event ID</dt>
                      <dd className="mt-1 break-all text-sm text-slate-900">{team?.event_id || "-"}</dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Leader ID</dt>
                      <dd className="mt-1 break-all text-sm text-slate-900">{team?.leader_id || "-"}</dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Created</dt>
                      <dd className="mt-1 text-sm text-slate-900">{formatDateTime(team?.created_at)}</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Event Snapshot</h3>
                  </div>
                  {event ? (
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</dt>
                        <dd className="mt-1 text-sm text-slate-900">{event?.name || "-"}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Category</dt>
                        <dd className="mt-1 text-sm text-slate-900">{event?.category || "-"}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Venue</dt>
                        <dd className="mt-1 text-sm text-slate-900">{event?.venue || "-"}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Platform</dt>
                        <dd className="mt-1 text-sm text-slate-900">{event?.platform || "-"}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Mode</dt>
                        <dd className="mt-1 text-sm text-slate-900">{event?.mode || "-"}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</dt>
                        <dd className="mt-1 text-sm text-slate-900">{event?.status || "-"}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-sm text-slate-500">Event data was not returned for the current include selection.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <UsersRound className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Members</h3>
                  </div>
                  {members.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {members.map((member, index) => (
                        <div key={member?.user_id || `${member?.email || "member"}-${index}`} className={`rounded-2xl border p-4 ${member?.is_leader ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900">{member?.name || "-"}</p>
                              <p className="text-xs text-slate-500">{member?.email || member?.user_id || "-"}</p>
                            </div>
                            {member?.is_leader ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Leader</span> : null}
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <InfoField label="College" value={member?.college || "-"} />
                            <InfoField label="Branch" value={member?.branch || "-"} />
                            <InfoField label="Year" value={member?.year || "-"} />
                            <InfoField label="Joined" value={formatDateTime(member?.joined_at)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Member data was not returned for the current include selection.</p>
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
                          <div key={round?.id || `${round?.name || "round"}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900">{round?.name || `Round ${index + 1}`}</p>
                                <p className="text-xs text-slate-500">{round?.id || "-"}</p>
                              </div>
                              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{round?.mode || "-"}</span>
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                              <InfoField label="Sequence" value={round?.sequence || "-"} />
                              <InfoField label="Status" value={round?.status || "-"} />
                              <InfoField label="Starts" value={formatDateTime(round?.starts_at)} />
                              <InfoField label="Ends" value={formatDateTime(round?.ends_at)} />
                            </div>
                            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Round points</p>
                              <p className="mt-1 text-sm text-slate-800">{Array.isArray(round?.round_points) && round.round_points.length ? round.round_points.join(" · ") : "-"}</p>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Panels</p>
                              {panelList.length ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {panelList.map((panel, panelIndex) => (
                                    <span key={panel?.id || `${panel?.name || "panel"}-${panelIndex}`} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700">
                                      {panel?.name || panel?.id || `Panel ${panelIndex + 1}`}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 text-sm text-slate-500">No panels were returned for this round.</p>
                              )}
                            </div>
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
                      {attendance.map((record, index) => {
                        const label = getPrimaryLabel(record, ["name", "user_name", "user", "team_name", "id"]);
                        return (
                          <div key={record?.id || `${label}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">{label}</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              <InfoField label="Status" value={record?.status || record?.attendance_status || record?.present || "-"} />
                              <InfoField label="Round" value={record?.round_id || record?.round || "-"} mono />
                              <InfoField label="User ID" value={record?.user_id || "-"} mono />
                              <InfoField label="Marked" value={formatDateTime(record?.created_at || record?.marked_at || record?.updated_at)} />
                            </div>
                          </div>
                        );
                      })}
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
                    <div className="grid gap-3 md:grid-cols-1">
                      {orders.map((order, index) => (
                        <div key={order?.id || `${order?.razorpay_order_id || "order"}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900">{order?.requested_team_name || team?.name || `Order ${index + 1}`}</p>
                              <p className="text-xs text-slate-500">{order?.razorpay_order_id || order?.id || "-"}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order?.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {order?.status || "-"}
                            </span>
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <InfoField label="Amount" value={typeof order?.amount === "number" ? `${order.amount} ${order?.currency || "INR"}` : "-"} />
                            <InfoField label="Payment ID" value={order?.razorpay_payment_id || order?.provider_payment_id || "-"} mono />
                            <InfoField label="Created" value={formatDateTime(order?.created_at)} />
                            <InfoField label="Paid at" value={formatDateTime(order?.paid_at)} />
                          </div>
                          <p className="mt-3 text-xs text-slate-500">Verified via {order?.verified_via || "-"}{order?.verified_at ? ` on ${formatDateTime(order.verified_at)}` : ""}</p>
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
                    <h3 className="text-sm font-semibold text-slate-900">Slots</h3>
                  </div>
                  {slots.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {slots.map((slot, index) => (
                        <div key={slot?.id || `${slot?.name || "slot"}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="font-semibold text-slate-900">{slot?.name || `Slot ${index + 1}`}</p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <InfoField label="ID" value={slot?.id || "-"} mono />
                            <InfoField label="Round ID" value={slot?.round_id || "-"} mono />
                            <InfoField label="Created" value={formatDateTime(slot?.created_at)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Slot data was not returned for the current include selection.</p>
                  )}
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
      </motion.div>
    </div>
  );
}

export default function EndeavourTeams() {
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 25, total: 0, has_next: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeIncludes, setActiveIncludes] = useState(["members", "events"]);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const includeQuery = useMemo(() => activeIncludes.join(","), [activeIncludes]);

  const fetchTeams = async ({ showLoader = true, page = pagination.page } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");
      const response = await endeavourApiClient.getTeamsFull({
        page,
        pageSize: pagination.page_size,
        include: includeQuery,
      });

      const data = response?.data || {};
      setTeams(Array.isArray(data?.teams) ? data.teams : []);
      setPagination((prev) => ({
        ...prev,
        ...(data?.pagination || prev),
      }));
    } catch (err) {
      setError(err?.message || "Failed to load teams");
      setTeams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeams({ showLoader: true, page: 1 });
  }, [includeQuery]);

  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) {
      return teams;
    }

    const query = searchTerm.toLowerCase();
    return teams.filter((entry) => {
      const team = entry?.team || {};
      return (
        team?.name?.toLowerCase().includes(query) ||
        team?.event_id?.toLowerCase().includes(query) ||
        team?.invite_code?.toLowerCase().includes(query)
      );
    });
  }, [teams, searchTerm]);

  const toggleInclude = (section) => {
    setActiveIncludes((prev) => {
      if (prev.includes(section)) {
        return prev.filter((item) => item !== section);
      }
      return [...prev, section];
    });
  };

  const openTeamDetail = async (teamId) => {
    setSelectedTeamId(teamId);
    setDetailData(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await endeavourApiClient.getTeamFull(teamId, includeQuery);
      setDetailData(response?.data || null);
    } catch (err) {
      setDetailError(err?.message || "Failed to load team profile");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeTeamDetail = () => {
    setSelectedTeamId("");
    setDetailData(null);
    setDetailError("");
    setDetailLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Team Profiles</h1>
            <p className="mt-1 text-sm text-slate-600">Integrated with /api/v1/admin/teams/full and /{`{team_id}`}/full</p>
          </div>

          <button
            type="button"
            onClick={() => fetchTeams({ showLoader: false })}
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
            placeholder="Search by team name, event id, invite code"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
          />
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
          <p className="mt-2 text-sm text-slate-600">Loading team profiles...</p>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Unable to load teams</p>
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
          {filteredTeams.length === 0 ? (
            <div className="p-12 text-center">
              <UsersRound className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No teams found for the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Event ID</th>
                    <th className="px-4 py-3">Leader</th>
                    <th className="px-4 py-3">Members</th>
                    <th className="px-4 py-3">Rounds</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((entry) => {
                    const team = entry?.team || {};
                    const leader = (entry?.members || []).find((member) => member?.is_leader);

                    return (
                      <tr key={team.id} className="border-t border-slate-200 text-sm text-slate-700">
                        <td className="px-4 py-3 font-medium text-slate-900">{team.name || "-"}</td>
                        <td className="px-4 py-3">{team.event_id || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                              <User className="h-4 w-4" />
                            </span>
                            <span>{leader?.name || "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{entry?.members?.length || 0}</td>
                        <td className="px-4 py-3">{entry?.rounds?.length || 0}</td>
                        <td className="px-4 py-3">{entry?.attendance?.length || 0}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openTeamDetail(team.id)}
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
            onClick={() => fetchTeams({ showLoader: false, page: Math.max(1, (pagination.page || 1) - 1) })}
            disabled={(pagination.page || 1) <= 1 || refreshing}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => fetchTeams({ showLoader: false, page: (pagination.page || 1) + 1 })}
            disabled={!pagination.has_next || refreshing}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <TeamDetailModal
        isOpen={Boolean(selectedTeamId)}
        data={detailData}
        loading={detailLoading}
        error={detailError}
        onClose={closeTeamDetail}
      />
    </div>
  );
}
