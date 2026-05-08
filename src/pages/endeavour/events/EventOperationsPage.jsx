// pages/admin/events/EventOperationsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Loader2, ArrowLeft, UserPlus, Sparkles, LayoutGrid,
  AlertCircle, CheckCircle2, X, Calendar, Clock, Tag,
  Mail, Send, RefreshCw,
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
      <RoundSelect label="Round" required rounds={rounds} value={form.roundId} onChange={set("roundId")} />
      <PanelSelect label="Panel" required roundId={form.roundId} rounds={rounds} value={form.panelId} onChange={set("panelId")} />
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
          <input className={inputCls} type="datetime-local" value={form.start_time} onChange={(e) => set("start_time")(e.target.value)} />
        </Field>
        <Field label="Shift End">
          <input className={inputCls} type="datetime-local" value={form.end_time} onChange={(e) => set("end_time")(e.target.value)} />
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
      <RoundSelect label="Target Round" required rounds={rounds} value={form.roundId} onChange={set("roundId")} />
      <RoundSelect label="From Round" rounds={rounds} value={form.from_round_id} onChange={set("from_round_id")} />
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
  const [assignForm,    setAssignForm]    = useState({ roundId: "", panel_id: "", seed: "" });
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
          <p className="mt-0.5 text-sm text-slate-500">Generate sequential time slots starting from a given time.</p>
        </div>
        <RoundSelect label="Round" required rounds={rounds} value={createForm.roundId} onChange={setC("roundId")} />
        <PanelSelect label="Panel" optional roundId={createForm.roundId} rounds={rounds} value={createForm.panel_id} onChange={setC("panel_id")} />
        <Field label="Start Time" required>
          <input className={inputCls} type="datetime-local" value={createForm.start_time} onChange={(e) => setC("start_time")(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Duration" hint="min">
            <input className={inputCls} type="number" min="1" placeholder="30" value={createForm.slot_duration_min} onChange={(e) => setC("slot_duration_min")(e.target.value)} />
          </Field>
          <Field label="Count">
            <input className={inputCls} type="number" min="1" placeholder="10" value={createForm.slot_count} onChange={(e) => setC("slot_count")(e.target.value)} />
          </Field>
          <Field label="Capacity" hint="/ slot">
            <input className={inputCls} type="number" min="1" placeholder="5" value={createForm.capacity_per_slot} onChange={(e) => setC("capacity_per_slot")(e.target.value)} />
          </Field>
        </div>

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
            {loading === "create_slots" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LayoutGrid className="h-4 w-4" />}
            Create Slots
          </button>
        </div>
      </div>

      <div className="lg:hidden border-t border-slate-200" />

      {/* Assign Random Slots */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Assign Random Slots</h3>
          <p className="mt-0.5 text-sm text-slate-500">Randomly distribute registered participants into existing slots.</p>
        </div>
        <RoundSelect label="Round" required rounds={rounds} value={assignForm.roundId} onChange={setA("roundId")} />
        <PanelSelect label="Panel" optional roundId={assignForm.roundId} rounds={rounds} value={assignForm.panel_id} onChange={setA("panel_id")} />
        <Field label="Random Seed" hint="optional — for reproducibility">
          <input className={inputCls} type="number" placeholder="e.g. 42" value={assignForm.seed} onChange={(e) => setA("seed")(e.target.value)} />
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

// ─── Tab: Mail ────────────────────────────────────────────────────────────────

const FILTER_TYPES = [
  { value: "all",              label: "All Participants",    hint: "Everyone registered for this event" },
  { value: "registered",       label: "Registered Only",     hint: "Registered but not yet checked in" },
  { value: "round_qualified",  label: "Round Qualified",     hint: "Participants who qualified for the next round" },
  { value: "round_eliminated", label: "Round Eliminated",    hint: "Participants eliminated in the last round" },
];

const JOB_STATUS_CONFIG = {
  queued:     { color: "text-blue-600    bg-blue-50    border-blue-100",    icon: Clock,         label: "Queued"     },
  pending:    { color: "text-amber-600   bg-amber-50   border-amber-100",   icon: Clock,         label: "Pending"    },
  processing: { color: "text-indigo-600  bg-indigo-50  border-indigo-100",  icon: Loader2,       label: "Processing" },
  completed:  { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2,  label: "Completed"  },
  failed:     { color: "text-red-600     bg-red-50     border-red-100",     icon: AlertCircle,   label: "Failed"     },
};

function JobStatusCard({ job, eventId, onRefresh }) {
  const [polling, setPolling] = useState(false);
  const cfg  = JOB_STATUS_CONFIG[job.status] ?? JOB_STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const isTerminal = job.status === "completed" || job.status === "failed";
  const pct = job.total_recipients > 0
    ? Math.round((job.sent_count / job.total_recipients) * 100)
    : 0;

  const handleRefresh = async () => {
    setPolling(true);
    await onRefresh(job.job_id);
    setPolling(false);
  };

  // Auto-poll every 10s while non-terminal
  useEffect(() => {
    if (isTerminal) return;
    const t = setInterval(() => onRefresh(job.job_id), 10000);
    return () => clearInterval(t);
  }, [job.job_id, isTerminal, onRefresh]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{job.subject}</p>
          <p className="mt-0.5 font-mono text-xs text-slate-400">{job.job_id}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
            <Icon className={`h-3 w-3 ${job.status === "processing" ? "animate-spin" : ""}`} />
            {cfg.label}
          </span>
          {!isTerminal && (
            <button
              onClick={handleRefresh}
              disabled={polling}
              title="Refresh status"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${polling ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {job.total_recipients > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{job.sent_count.toLocaleString()} sent</span>
            <span>{job.total_recipients.toLocaleString()} total · {pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                job.status === "failed" ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {job.last_error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {job.last_error}
        </div>
      )}

      {/* Timestamps */}
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
        {job.created_at && <span>Created {fmt(job.created_at)}</span>}
        {job.updated_at && <span>Updated {fmt(job.updated_at)}</span>}
      </div>
    </div>
  );
}

function MailTab({ eventId, setToast }) {
  const { loading, run } = useActionRunner(setToast);

  const [form, setForm] = useState({ subject: "", body_html: "", filter_type: "all" });
  const [preview, setPreview]   = useState(false);
  const [confirm, setConfirm]   = useState(false);
  const [jobs,    setJobs]       = useState([]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const isValid = form.subject.trim() && form.body_html.trim() && form.filter_type;

  const handleSend = async () => {
    setConfirm(false);
    const res = await run("send_campaign", () =>
      endeavourApiClient.createMailCampaign(eventId, {
        subject:     form.subject.trim(),
        body_html:   form.body_html.trim(),
        filter_type: form.filter_type,
      })
    );
    if (res?.job_id) {
      setJobs((prev) => [
        {
          job_id:           res.job_id,
          status:           res.status || "queued",
          subject:          form.subject.trim(),
          filter_type:      form.filter_type,
          total_recipients: 0,
          sent_count:       0,
          created_at:       new Date().toISOString(),
          updated_at:       new Date().toISOString(),
          last_error:       null,
        },
        ...prev,
      ]);
      setForm({ subject: "", body_html: "", filter_type: "all" });
      setPreview(false);
    }
  };

  const refreshJob = useCallback(async (jobId) => {
    try {
      const res = await endeavourApiClient.getMailCampaignStatus(eventId, jobId);
      if (res) setJobs((prev) => prev.map((j) => (j.job_id === jobId ? { ...j, ...res } : j)));
    } catch {
      // silent — polling errors shouldn't toast
    }
  }, [eventId]);

  const filterLabel = FILTER_TYPES.find((f) => f.value === form.filter_type)?.label || form.filter_type;

  const wrapSelection = (e, tag) => {
    e.preventDefault();
    const ta    = e.currentTarget.closest(".mail-editor-wrap").querySelector("textarea");
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = form.body_html.slice(start, end);
    const next  = form.body_html.slice(0, start) + `<${tag}>${sel}</${tag}>` + form.body_html.slice(end);
    setForm((p) => ({ ...p, body_html: next }));
    // restore cursor after state update
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + sel.length);
    });
  };

  return (
    <div className="space-y-6">

      {/* ── Compose + Preview panel ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">

        {/* Left: compose form */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Compose Campaign</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Send a bulk email to participants of this event. Campaigns are queued and processed asynchronously.
            </p>
          </div>

          {/* Subject */}
          <Field label="Subject" required>
            <input
              className={inputCls}
              placeholder="e.g. Congratulations on qualifying for Round 2!"
              value={form.subject}
              onChange={set("subject")}
            />
          </Field>

          {/* Audience filter */}
          <Field label="Send To" required hint="filter_type">
            <div className="grid grid-cols-2 gap-2">
              {FILTER_TYPES.map((ft) => (
                <label
                  key={ft.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    form.filter_type === ft.value
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="filter_type"
                    value={ft.value}
                    checked={form.filter_type === ft.value}
                    onChange={set("filter_type")}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{ft.label}</p>
                    <p className="text-xs text-slate-500">{ft.hint}</p>
                  </div>
                </label>
              ))}
            </div>
          </Field>

          {/* Body HTML editor */}
          <Field label="Email Body (HTML)" required>
            <div className="mail-editor-wrap rounded-xl border border-slate-300 overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
              {/* Mini toolbar */}
              <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
                {[
                  { label: "B",  tag: "strong", cls: "font-bold text-xs"    },
                  { label: "I",  tag: "em",     cls: "italic text-xs"       },
                  { label: "H1", tag: "h1",     cls: "text-xs font-semibold" },
                  { label: "H2", tag: "h2",     cls: "text-xs font-semibold" },
                  { label: "P",  tag: "p",      cls: "text-xs"              },
                  { label: "A",  tag: "a",      cls: "text-xs"              },
                ].map(({ label, tag, cls }) => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={(e) => wrapSelection(e, tag)}
                    className={`rounded px-2 py-1 text-slate-600 hover:bg-slate-200 transition ${cls}`}
                  >
                    {label}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setPreview((p) => !p)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    preview ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {preview ? "← Edit" : "Preview"}
                </button>
              </div>

              {preview ? (
                <div
                  className="prose prose-sm max-w-none min-h-[180px] px-4 py-3 text-sm text-slate-800"
                  dangerouslySetInnerHTML={{
                    __html: form.body_html || "<p class='text-slate-400 not-prose'>Nothing to preview yet.</p>",
                  }}
                />
              ) : (
                <textarea
                  className="w-full min-h-[180px] resize-y px-3 py-2.5 text-sm text-slate-800 font-mono outline-none bg-white"
                  placeholder={"<h1>Hello!</h1>\n<p>You've been selected for Round 2.</p>"}
                  value={form.body_html}
                  onChange={set("body_html")}
                />
              )}
            </div>
          </Field>

          {/* Send / Confirm */}
          {confirm ? (
            <ConfirmBanner
              message={`Send campaign to "${filterLabel}" participants?`}
              note="This will queue a bulk email. It cannot be cancelled once processing starts."
              loading={loading === "send_campaign"}
              onConfirm={handleSend}
              onCancel={() => setConfirm(false)}
            />
          ) : (
            <div className="pt-1">
              <button
                onClick={() => setConfirm(true)}
                disabled={!isValid || !!loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
              >
                {loading === "send_campaign"
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
                Send Campaign
              </button>
            </div>
          )}
        </div>

        {/* Right: sticky summary card */}
        <div className="hidden xl:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Summary</p>

            <div>
              <p className="text-xs text-slate-500 mb-1">Subject</p>
              <p className="text-sm font-medium text-slate-900 break-words">
                {form.subject.trim() || <span className="text-slate-400 font-normal italic">No subject yet…</span>}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Audience</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <Mail className="h-3 w-3" />
                {filterLabel}
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Body preview</p>
              {form.body_html.trim() ? (
                <div
                  className="prose prose-xs max-w-none rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 overflow-hidden max-h-[180px]"
                  dangerouslySetInnerHTML={{ __html: form.body_html }}
                />
              ) : (
                <p className="text-xs italic text-slate-400">No body yet…</p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Checklist</p>
              {[
                { label: "Subject added",     ok: !!form.subject.trim()    },
                { label: "Audience selected", ok: !!form.filter_type       },
                { label: "Body written",      ok: !!form.body_html.trim()  },
              ].map(({ label, ok }) => (
                <div key={label} className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-700" : "text-slate-400"}`}>
                  {ok
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    : <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" />
                  }
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sent campaigns ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Sent Campaigns
            {jobs.length > 0 && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                {jobs.length}
              </span>
            )}
          </h3>
          {jobs.some((j) => j.status !== "completed" && j.status !== "failed") && (
            <p className="text-xs text-slate-400">Auto-refreshing every 10s</p>
          )}
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobStatusCard key={job.job_id} job={job} eventId={eventId} onRefresh={refreshJob} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <Mail className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No campaigns sent yet for this event.</p>
            <p className="mt-1 text-xs text-slate-400">Campaigns you send will appear here with live status tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "coordinator", label: "Coordinator", icon: UserPlus,   color: "text-indigo-600" },
  { id: "promotions",  label: "Promotions",  icon: Sparkles,   color: "text-purple-600" },
  { id: "slots",       label: "Slots",       icon: LayoutGrid, color: "text-orange-600" },
  { id: "mail",        label: "Mail",        icon: Mail,       color: "text-blue-600"   },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventOperationsPage() {
  const { eventId }                     = useParams();
  const navigate                        = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab                       = searchParams.get("tab") || "coordinator";

  const [eventMeta,   setEventMeta]   = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError,   setMetaError]   = useState("");
  const [toast,       setToast]       = useState(null);

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
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Event Operations</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">{event?.name}</h1>
            <p className="mt-0.5 font-mono text-xs text-slate-400">{event?.id}</p>
          </div>
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
        {activeTab === "mail" && (
          <MailTab eventId={eventId} setToast={setToast} />
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}