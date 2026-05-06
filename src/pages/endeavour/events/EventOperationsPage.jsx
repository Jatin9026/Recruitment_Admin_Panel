// pages/admin/events/EventOperationsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Loader2, ArrowLeft, UserPlus, Sparkles, LayoutGrid,
  AlertCircle, CheckCircle2, X, Trash2, PlusCircle,
  Calendar, Clock, Tag, ChevronDown,
} from "lucide-react";
import { ENDEAVOUR_PATHS } from "../../../modules/endeavour/paths";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

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

function RoundSelect({ label = "Round", required, rounds, value, onChange }) {
  if (!rounds.length) {
    return (
      <Field label={label} required={required}>
        <input
          className={inputCls}
          placeholder="No rounds available"
          disabled
          value=""
          readOnly
        />
      </Field>
    );
  }
  return (
    <Field label={label} required={required}>
      <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a round…</option>
        {rounds.map(({ round }) => (
          <option key={round.id} value={round.id}>
            {round.name} — {round.mode} · Seq {round.sequence}
          </option>
        ))}
      </select>
    </Field>
  );
}

function PanelSelect({ label = "Panel", optional, roundId, rounds, value, onChange }) {
  const panels = useMemo(
    () => rounds.find(({ round }) => round.id === roundId)?.panels || [],
    [rounds, roundId]
  );
  const lbl = optional ? `${label} (optional)` : label;

  if (!panels.length) {
    return (
      <Field label={lbl}>
        <input
          className={inputCls}
          placeholder={roundId ? "No panels for this round" : "Select a round first"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }
  return (
    <Field label={lbl}>
      <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{optional ? "All panels" : "Select a panel…"}</option>
        {panels.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </Field>
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
    <div className={`fixed bottom-5 right-5 z-50 flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl text-sm max-w-sm w-full ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Confirm Banner ───────────────────────────────────────────────────────────

function ConfirmBanner({ message, note, onConfirm, onCancel, loading }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">{message}</p>
      {note && <p className="mt-0.5 text-xs text-amber-700">{note}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60 transition"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-amber-300 px-4 py-1.5 text-sm text-amber-700 hover:bg-amber-100 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── useActionRunner ──────────────────────────────────────────────────────────

function useActionRunner(setToast) {
  const [loading, setLoading] = useState("");

  const run = useCallback(async (name, fn) => {
    try {
      setLoading(name);
      const res = await fn();
      setToast({ type: "success", message: res?.message || `${name.replace(/_/g, " ")} succeeded` });
      return res;
    } catch (err) {
      setToast({ type: "error", message: err?.message || `${name.replace(/_/g, " ")} failed` });
      return null;
    } finally {
      setLoading("");
    }
  }, [setToast]);

  return { loading, run };
}

// ─── Tab: Coordinator ─────────────────────────────────────────────────────────

function CoordinatorTab({ eventId, rounds, setToast }) {
  const { loading, run } = useActionRunner(setToast);
  const [form, setForm] = useState({
    roundId: "", panelId: "", ecell_member_id: "", start_time: "", end_time: "",
  });

  const set = (k) => (val) =>
    setForm((p) => ({ ...p, [k]: val, ...(k === "roundId" ? { panelId: "" } : {}) }));

  const isValid = form.roundId && form.panelId && form.ecell_member_id.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    const res = await run("assign_coordinator", () =>
      endeavourApiClient.assignPanelCoordinator(eventId, form.roundId, form.panelId, {
        ecell_member_id: form.ecell_member_id.trim(),
        ...(form.start_time ? { start_time: form.start_time } : {}),
        ...(form.end_time   ? { end_time: form.end_time }     : {}),
      })
    );
    if (res) setForm({ roundId: "", panelId: "", ecell_member_id: "", start_time: "", end_time: "" });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Assign an E-Cell member as coordinator for a specific panel within a round.
      </p>
      <RoundSelect
        label="Round"
        required
        rounds={rounds}
        value={form.roundId}
        onChange={set("roundId")}
      />
      <PanelSelect
        label="Panel"
        required
        roundId={form.roundId}
        rounds={rounds}
        value={form.panelId}
        onChange={set("panelId")}
      />
      <Field label="E-Cell Member ID" required>
        <input
          className={inputCls}
          placeholder="e.g. ecell_001"
          value={form.ecell_member_id}
          onChange={(e) => set("ecell_member_id")(e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Shift Start">
          <input
            className={inputCls}
            type="datetime-local"
            value={form.start_time}
            onChange={(e) => set("start_time")(e.target.value)}
          />
        </Field>
        <Field label="Shift End">
          <input
            className={inputCls}
            type="datetime-local"
            value={form.end_time}
            onChange={(e) => set("end_time")(e.target.value)}
          />
        </Field>
      </div>
      <div className="pt-1">
        <button
          onClick={handleSubmit}
          disabled={!isValid || !!loading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
        >
          {loading === "assign_coordinator"
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <UserPlus className="h-4 w-4" />
          }
          Assign Coordinator
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Promotions ──────────────────────────────────────────────────────────

function PromotionsTab({ eventId, rounds, setToast }) {
  const { loading, run } = useActionRunner(setToast);
  const [form, setForm] = useState({ roundId: "", from_round_id: "", emailsCsv: "" });
  const [confirm, setConfirm] = useState(false);

  const set = (k) => (val) => setForm((p) => ({ ...p, [k]: val }));

  const emails = useMemo(
    () => form.emailsCsv.split(",").map((e) => e.trim()).filter(Boolean),
    [form.emailsCsv]
  );

  const isValid = form.roundId && emails.length > 0;

  const handleConfirm = async () => {
    setConfirm(false);
    const res = await run("promote_round", () =>
      endeavourApiClient.promoteRoundByEmails(eventId, form.roundId, {
        ...(form.from_round_id.trim() ? { from_round_id: form.from_round_id.trim() } : {}),
        emails,
      })
    );
    if (res) setForm({ roundId: "", from_round_id: "", emailsCsv: "" });
  };

  const targetRoundName = rounds.find(({ round }) => round.id === form.roundId)?.round?.name;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Promote specific participants to a target round by entering their email addresses.
      </p>
      <RoundSelect
        label="Target Round"
        required
        rounds={rounds}
        value={form.roundId}
        onChange={set("roundId")}
      />
      <RoundSelect
        label="From Round"
        rounds={rounds}
        value={form.from_round_id}
        onChange={set("from_round_id")}
      />
      <Field label="Emails" required hint="comma-separated">
        <textarea
          className={`${inputCls} min-h-[100px] resize-y`}
          placeholder="alice@example.com, bob@example.com"
          value={form.emailsCsv}
          onChange={(e) => set("emailsCsv")(e.target.value)}
        />
        {emails.length > 0 && (
          <p className="mt-1 text-xs text-slate-400">{emails.length} email{emails.length !== 1 ? "s" : ""} entered</p>
        )}
      </Field>

      {confirm ? (
        <ConfirmBanner
          message={`Promote ${emails.length} participant(s) to "${targetRoundName}"?`}
          note="Participants will receive a notification. This cannot be undone."
          loading={loading === "promote_round"}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(false)}
        />
      ) : (
        <div className="pt-1">
          <button
            onClick={() => setConfirm(true)}
            disabled={!isValid || !!loading}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Promote by Emails
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Slots ───────────────────────────────────────────────────────────────

function SlotsTab({ eventId, rounds, setToast }) {
  const { loading, run } = useActionRunner(setToast);

  const [createForm, setCreateForm] = useState({
    roundId: "", panel_id: "", start_time: "",
    slot_duration_min: "", slot_count: "", capacity_per_slot: "",
  });
  const [assignForm,  setAssignForm]  = useState({ roundId: "", panel_id: "", seed: "" });
  const [confirmAssign, setConfirmAssign] = useState(false);

  const setC = (k) => (val) =>
    setCreateForm((p) => ({ ...p, [k]: val, ...(k === "roundId" ? { panel_id: "" } : {}) }));
  const setA = (k) => (val) =>
    setAssignForm((p) => ({ ...p, [k]: val, ...(k === "roundId" ? { panel_id: "" } : {}) }));

  const createValid = createForm.roundId && createForm.start_time &&
    createForm.slot_duration_min && createForm.slot_count && createForm.capacity_per_slot;

  const handleCreateSlots = async () => {
    if (!createValid) return;
    const res = await run("create_slots", () =>
      endeavourApiClient.createOfflineSlots(eventId, createForm.roundId, {
        ...(createForm.panel_id.trim() ? { panel_id: createForm.panel_id.trim() } : {}),
        start_time:        createForm.start_time,
        slot_duration_min: Number(createForm.slot_duration_min),
        slot_count:        Number(createForm.slot_count),
        capacity_per_slot: Number(createForm.capacity_per_slot),
      })
    );
    if (res) setCreateForm({ roundId: "", panel_id: "", start_time: "", slot_duration_min: "", slot_count: "", capacity_per_slot: "" });
  };

  const handleAssignRandom = async () => {
    setConfirmAssign(false);
    const res = await run("assign_random_slots", () =>
      endeavourApiClient.assignRandomSlots(eventId, assignForm.roundId, {
        ...(assignForm.panel_id.trim() ? { panel_id: assignForm.panel_id.trim() } : {}),
        ...(assignForm.seed !== ""     ? { seed: Number(assignForm.seed) }         : {}),
      })
    );
    if (res) setAssignForm({ roundId: "", panel_id: "", seed: "" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* Create Slots */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Create Offline Slots</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Generate sequential time slots starting from a given time.
          </p>
        </div>
        <RoundSelect
          label="Round" required rounds={rounds}
          value={createForm.roundId} onChange={setC("roundId")}
        />
        <PanelSelect
          label="Panel" optional roundId={createForm.roundId} rounds={rounds}
          value={createForm.panel_id} onChange={setC("panel_id")}
        />
        <Field label="Start Time" required>
          <input
            className={inputCls} type="datetime-local"
            value={createForm.start_time}
            onChange={(e) => setC("start_time")(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Duration" hint="min">
            <input
              className={inputCls} type="number" min="1" placeholder="30"
              value={createForm.slot_duration_min}
              onChange={(e) => setC("slot_duration_min")(e.target.value)}
            />
          </Field>
          <Field label="Count">
            <input
              className={inputCls} type="number" min="1" placeholder="10"
              value={createForm.slot_count}
              onChange={(e) => setC("slot_count")(e.target.value)}
            />
          </Field>
          <Field label="Capacity" hint="/ slot">
            <input
              className={inputCls} type="number" min="1" placeholder="5"
              value={createForm.capacity_per_slot}
              onChange={(e) => setC("capacity_per_slot")(e.target.value)}
            />
          </Field>
        </div>

        {/* Preview pill */}
        {createForm.slot_duration_min && createForm.slot_count && createForm.capacity_per_slot && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 space-y-0.5">
            <p><span className="font-semibold">{createForm.slot_count}</span> slots × <span className="font-semibold">{createForm.slot_duration_min} min</span> each</p>
            <p>Total duration: <span className="font-semibold">{createForm.slot_count * createForm.slot_duration_min} min</span></p>
            <p>Capacity per slot: <span className="font-semibold">{createForm.capacity_per_slot}</span> participant(s)</p>
          </div>
        )}

        <div className="pt-1">
          <button
            onClick={handleCreateSlots}
            disabled={!createValid || !!loading}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading === "create_slots"
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <LayoutGrid className="h-4 w-4" />
            }
            Create Slots
          </button>
        </div>
      </div>

      {/* Divider on mobile, vertical line on desktop */}
      <div className="lg:hidden border-t border-slate-200" />
      <div className="hidden lg:block w-px bg-slate-200 mx-auto" />

      {/* Assign Random Slots */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Assign Random Slots</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Randomly distribute registered participants into existing slots.
          </p>
        </div>
        <RoundSelect
          label="Round" required rounds={rounds}
          value={assignForm.roundId} onChange={setA("roundId")}
        />
        <PanelSelect
          label="Panel" optional roundId={assignForm.roundId} rounds={rounds}
          value={assignForm.panel_id} onChange={setA("panel_id")}
        />
        <Field label="Random Seed" hint="optional — for reproducibility">
          <input
            className={inputCls} type="number" placeholder="e.g. 42"
            value={assignForm.seed}
            onChange={(e) => setA("seed")(e.target.value)}
          />
        </Field>

        {confirmAssign ? (
          <ConfirmBanner
            message="Randomly assign all participants to slots?"
            note="Existing assignments for this round may be overwritten."
            loading={loading === "assign_random_slots"}
            onConfirm={handleAssignRandom}
            onCancel={() => setConfirmAssign(false)}
          />
        ) : (
          <div className="pt-1">
            <button
              onClick={() => setConfirmAssign(true)}
              disabled={!assignForm.roundId || !!loading}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 transition shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Assign Random Slots
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "coordinator", label: "Coordinator", icon: UserPlus,   color: "text-indigo-600" },
  { id: "promotions",  label: "Promotions",  icon: Sparkles,   color: "text-purple-600" },
  { id: "slots",       label: "Slots",       icon: LayoutGrid, color: "text-orange-600" },
];

export default function EventOperationsPage() {
  const { eventId }                     = useParams();
  const navigate                        = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab                       = searchParams.get("tab") || "coordinator";

  const [eventMeta, setEventMeta] = useState(null);   // { event, rounds }
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError,   setMetaError]   = useState("");

  const [toast, setToast] = useState(null);

  // ── Load event meta (name + rounds for dropdowns) ──────────────────────────

  useEffect(() => {
    (async () => {
      try {
        setMetaLoading(true);
        setMetaError("");
        const res = await endeavourApiClient.getEventById(eventId);
        setEventMeta(res?.data || null);
      } catch (err) {
        setMetaError(err?.message || "Failed to load event");
      } finally {
        setMetaLoading(false);
      }
    })();
  }, [eventId]);

  const rounds = eventMeta?.rounds || [];

  // ── Render ─────────────────────────────────────────────────────────────────

  if (metaLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <button
          onClick={() => navigate(ENDEAVOUR_PATHS.events)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {metaError}
        </div>
      </div>
    );
  }

  const event = eventMeta?.event;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

      {/* ── Back nav ── */}
      <button
        onClick={() => navigate(ENDEAVOUR_PATHS.events)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </button>

      {/* ── Event context card ── */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Event Operations
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">
              {event?.name}
            </h1>
            <p className="mt-0.5 font-mono text-xs text-slate-400">{event?.id}</p>
          </div>

          {/* Event quick stats */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{fmt(event?.start_time)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{fmt(event?.end_time)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span>{rounds.length} round{rounds.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* Rounds quick reference */}
        {rounds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {rounds.map(({ round }) => (
              <span
                key={round.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
              >
                <span className="font-medium">{round.name}</span>
                <span className="text-slate-400">·</span>
                <span className="capitalize">{round.mode}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit shadow-sm">
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setSearchParams({ tab: id })}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === id
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon className={`h-4 w-4 ${activeTab === id ? "text-white" : color}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Panel ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === "coordinator" && (
          <CoordinatorTab eventId={eventId} rounds={rounds} setToast={setToast} />
        )}
        {activeTab === "promotions" && (
          <PromotionsTab eventId={eventId} rounds={rounds} setToast={setToast} />
        )}
        {activeTab === "slots" && (
          <SlotsTab eventId={eventId} rounds={rounds} setToast={setToast} />
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}