// pages/admin/events/EventsManagerPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2, RefreshCw, PlusCircle, Search, Calendar, Clock,
  Pencil, Save, Trash2, AlertCircle, CheckCircle2, X, FileText,
  MapPin, Users, Tag, Award, Link as LinkIcon, Eye, Settings2,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { getEndeavourEventOperationsPath } from "../../../modules/endeavour/paths";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const toLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const STATUS_BADGE = {
  upcoming:  "bg-blue-50 text-blue-700 border-blue-100",
  live:      "bg-emerald-50 text-emerald-700 border-emerald-100",
  completed: "bg-slate-100 text-slate-500 border-slate-200",
};

const emptyRound = () => ({
  _key: Math.random().toString(36).slice(2),
  name: "", sequence: "", mode: "online", starts_at: "", ends_at: "",
});

const STATUS_OPTIONS = ["", "upcoming", "live", "completed"];

// ─── Shared atoms ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400";
const selectCls = `${inputCls} bg-white`;

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
        <span>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
        {hint && <span className="font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, subtitle, width = "max-w-2xl", children }) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative z-10 w-full ${width} rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, type === "error" ? 6000 : 4000);
    return () => clearTimeout(t);
  }, [message]);

  const styles = type === "error"
    ? "border-red-200 text-red-800"
    : "border-emerald-200 text-emerald-800";
  const Icon = type === "error" ? AlertCircle : CheckCircle2;

  return (
    <div className={`fixed bottom-5 right-5 z-[60] flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl text-sm max-w-sm w-full ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Round Builder (used inside Create/Edit modal) ────────────────────────────

function RoundBuilder({ rounds, onChange }) {
  const add    = () => onChange([...rounds, emptyRound()]);
  const remove = (key) => onChange(rounds.filter((r) => r._key !== key));
  const update = (key, k, v) =>
    onChange(rounds.map((r) => (r._key === key ? { ...r, [k]: v } : r)));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">Rounds</label>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Add Round
        </button>
      </div>

      {rounds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
          No rounds yet — click "Add Round" to begin.
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round, idx) => (
            <div key={round._key} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Round {idx + 1}</span>
                <button
                  onClick={() => remove(round._key)}
                  className="text-slate-400 hover:text-red-500 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Name" required>
                  <input
                    className={inputCls}
                    placeholder="e.g. Screening"
                    value={round.name}
                    onChange={(e) => update(round._key, "name", e.target.value)}
                  />
                </Field>
                <Field label="Sequence">
                  <input
                    className={inputCls}
                    type="number"
                    placeholder="1"
                    value={round.sequence}
                    onChange={(e) => update(round._key, "sequence", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Mode">
                <select
                  className={selectCls}
                  value={round.mode}
                  onChange={(e) => update(round._key, "mode", e.target.value)}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Starts At">
                  <input
                    className={inputCls}
                    type="datetime-local"
                    value={round.starts_at}
                    onChange={(e) => update(round._key, "starts_at", e.target.value)}
                  />
                </Field>
                <Field label="Ends At">
                  <input
                    className={inputCls}
                    type="datetime-local"
                    value={round.ends_at}
                    onChange={(e) => update(round._key, "ends_at", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function EventDetailModal({ open, onClose, eventId, onEdit, onGoToOps }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!open || !eventId) return;
    setDetail(null);
    setError("");
    setLoading(true);
    endeavourApiClient
      .getEventById(eventId)
      .then((res) => setDetail(res?.data || null))
      .catch((err) => setError(err?.message || "Failed to load event"))
      .finally(() => setLoading(false));
  }, [open, eventId]);

  const event  = detail?.event;
  const rounds = detail?.rounds || [];

  const INFO = [
    { icon: Tag,      label: "Event ID",   value: event?.id },
    { icon: FileText, label: "Name",       value: event?.name },
    { icon: Calendar, label: "Start",      value: fmt(event?.start_time) },
    { icon: Clock,    label: "End",        value: fmt(event?.end_time) },
    { icon: MapPin,   label: "Venue",      value: event?.venue },
    { icon: Users,    label: "Capacity",   value: event?.max_capacity },
    { icon: Award,    label: "Team Event", value: event?.is_team_event ? "Yes" : "No" },
    { icon: LinkIcon, label: "Mode",       value: event?.mode, cap: true },
    { icon: Tag,      label: "Price",      value: event?.price != null ? `₹${event.price}` : undefined },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Event Details"
      subtitle={event ? `${event.name} · ${event.id}` : ""}
      width="max-w-2xl"
    >
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {detail && !loading && (
        <div className="space-y-5">
          {/* Info grid */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Information
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {INFO.map(({ icon: Icon, label, value, cap }) =>
                value != null ? (
                  <div key={label} className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={`mt-0.5 text-sm font-medium text-slate-800 ${cap ? "capitalize" : ""}`}>
                        {value}
                      </p>
                    </div>
                  </div>
                ) : null
              )}
              {event?.is_team_event && (
                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Team Size</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-800">
                      {event.min_team_size} – {event.max_team_size}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {event?.description && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500">Description</p>
                <p className="mt-1 text-sm text-slate-700">{event.description}</p>
              </div>
            )}
            {event?.rules_url && (
              <a
                href={event.rules_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <FileText className="h-3.5 w-3.5" /> Rules & Guidelines
              </a>
            )}
          </div>

          {/* Rounds */}
          {rounds.length > 0 && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Rounds & Panels
              </p>
              <div className="space-y-2">
                {rounds.map(({ round, panels }, idx) => (
                  <div key={round?.id || idx} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {round?.name}{" "}
                        <span className="text-xs font-normal text-slate-400">Seq {round?.sequence}</span>
                      </p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs capitalize text-slate-600">
                        {round?.mode}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {fmt(round?.starts_at)} — {fmt(round?.ends_at)}
                    </p>
                    {panels?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {panels.map((p) => (
                          <span key={p.id} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => { onClose(); onEdit(detail); }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Pencil className="h-4 w-4" /> Edit Event
            </button>
            <button
              onClick={() => { onClose(); onGoToOps(event?.id); }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
            >
              <Settings2 className="h-4 w-4" /> Manage Operations
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

function EventFormModal({ open, onClose, prefill, onSuccess }) {
  const isEdit = !!prefill;

  const blank = { id: "", name: "", start_time: "", end_time: "", rounds: [] };

  const [form, setForm]     = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  // Populate form whenever modal opens
  useEffect(() => {
    if (!open) return;
    if (isEdit && prefill) {
      const ev     = prefill.event;
      const rounds = prefill.rounds || [];
      setForm({
        id: ev?.id || "",
        name: ev?.name || "",
        start_time: toLocal(ev?.start_time),
        end_time:   toLocal(ev?.end_time),
        rounds: rounds.map(({ round }, idx) => ({
          _key:      round?.id || String(idx),
          name:      round?.name || "",
          sequence:  round?.sequence ?? idx + 1,
          mode:      round?.mode || "online",
          starts_at: toLocal(round?.starts_at),
          ends_at:   toLocal(round?.ends_at),
        })),
      });
    } else {
      setForm(blank);
    }
    setError("");
  }, [open, prefill]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim())            { setError("Name is required"); return; }
    if (!isEdit && !form.id.trim())   { setError("Event ID is required"); return; }

    const rounds = form.rounds.map(({ _key, ...r }) => ({
      ...r, sequence: Number(r.sequence),
    }));

    try {
      setSaving(true);
      setError("");
      if (isEdit) {
        await endeavourApiClient.updateEvent(form.id, {
          name:       form.name.trim(),
          start_time: form.start_time,
          end_time:   form.end_time,
          rounds,
        });
        onSuccess(`"${form.name}" updated successfully`);
      } else {
        await endeavourApiClient.createEvent({
          id:         form.id.trim(),
          name:       form.name.trim(),
          start_time: form.start_time,
          end_time:   form.end_time,
          rounds,
        });
        onSuccess(`"${form.name}" created successfully`);
      }
      onClose();
    } catch (err) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Event" : "Create Event"}
      subtitle={isEdit ? `Editing: ${form.id}` : "Fill in the details below to create a new event."}
      width="max-w-xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Event ID — only on create */}
        {!isEdit && (
          <Field label="Event ID" required hint="slug, e.g. hackathon-2026">
            <input
              className={inputCls}
              placeholder="hackathon-2026"
              value={form.id}
              onChange={set("id")}
            />
          </Field>
        )}

        <Field label="Name" required>
          <input
            className={inputCls}
            placeholder="e.g. National Hackathon 2026"
            value={form.name}
            onChange={set("name")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time">
            <input className={inputCls} type="datetime-local" value={form.start_time} onChange={set("start_time")} />
          </Field>
          <Field label="End Time">
            <input className={inputCls} type="datetime-local" value={form.end_time} onChange={set("end_time")} />
          </Field>
        </div>

        <RoundBuilder
          rounds={form.rounds}
          onChange={(rounds) => setForm((p) => ({ ...p, rounds }))}
        />
      </div>

      {/* Modal footer */}
      <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={onClose}
          disabled={saving}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition"
        >
          {saving
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Save className="h-4 w-4" />
          }
          {isEdit ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventsManagerPage() {
  const navigate = useNavigate();

  // Data
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search,       setSearch]       = useState("");

  // Sorting
  const [sortKey, setSortKey] = useState("name");   // "name" | "start_time" | "end_time" | "status"
  const [sortDir, setSortDir] = useState("asc");

  // Modals
  const [detailModal, setDetailModal] = useState({ open: false, eventId: null });
  const [formModal,   setFormModal]   = useState({ open: false, prefill: null });

  // Toast
  const [toast, setToast] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async ({ showLoader = true } = {}) => {
    try {
      showLoader ? setLoading(true) : setRefreshing(true);
      const res  = await endeavourApiClient.getEvents(statusFilter || undefined);
      const list = res?.data?.events || res?.events || [];
      setEvents(Array.isArray(list) ? list : []);
    } catch (err) {
      setToast({ type: "error", message: err?.message || "Failed to fetch events" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── Sort + Filter ──────────────────────────────────────────────────────────

  const displayed = useMemo(() => {
    let list = [...events];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.name?.toLowerCase().includes(q) || e.id?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return list;
  }, [events, search, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openDetail = (eventId) => setDetailModal({ open: true, eventId });
  const openCreate = () => setFormModal({ open: false, prefill: null }); // reset first
  
  // Small trick: close then re-open so useEffect re-fires cleanly
  const openEdit = (detail) => {
    setFormModal({ open: false, prefill: detail });
    setTimeout(() => setFormModal({ open: true, prefill: detail }), 0);
  };

  const handleFormSuccess = (message) => {
    setToast({ type: "success", message });
    fetchEvents({ showLoader: false });
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="h-3.5 w-3.5 opacity-20" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
      : <ChevronDown className="h-3.5 w-3.5 text-slate-600" />;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

      {/* ── Page header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {events.length} event{events.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, prefill: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition shadow-sm"
        >
          <PlusCircle className="h-4 w-4" /> New Event
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or ID…"
            className="rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-56"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Statuses"}
            </option>
          ))}
        </select>

        <button
          onClick={() => fetchEvents({ showLoader: false })}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                {[
                  { key: "name",       label: "Event" },
                  { key: "status",     label: "Status" },
                  { key: "start_time", label: "Start Time" },
                  { key: "end_time",   label: "End Time" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="cursor-pointer select-none px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      {label} <SortIcon col={key} />
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin" />
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                    No events found.
                  </td>
                </tr>
              ) : (
                displayed.map((event) => (
                  <tr
                    key={event.id}
                    className="group hover:bg-slate-50 transition"
                  >
                    {/* Event name + ID */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{event.name || event.id}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">{event.id}</p>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4">
                      {event.status ? (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[event.status] ?? STATUS_BADGE.completed}`}>
                          {event.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Start */}
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {fmt(event.start_time)}
                    </td>

                    {/* End */}
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {fmt(event.end_time)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openDetail(event.id)}
                          title="View Details"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button
                          onClick={() => navigate(getEndeavourEventOperationsPath(event.id))}
                          title="Manage Operations"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition"
                        >
                          <Settings2 className="h-3.5 w-3.5" /> Operations
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Row count footer */}
        {!loading && displayed.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            Showing {displayed.length} of {events.length} event{events.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <EventDetailModal
        open={detailModal.open}
        eventId={detailModal.eventId}
        onClose={() => setDetailModal({ open: false, eventId: null })}
        onEdit={openEdit}
        onGoToOps={(id) => navigate(getEndeavourEventOperationsPath(id))}
      />

      <EventFormModal
        open={formModal.open}
        prefill={formModal.prefill}
        onClose={() => setFormModal({ open: false, prefill: null })}
        onSuccess={handleFormSuccess}
      />

      {/* ── Toast ── */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}