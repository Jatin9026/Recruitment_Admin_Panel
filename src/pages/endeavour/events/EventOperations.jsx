import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  PlusCircle,
  RefreshCw,
  Settings,
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Tag,
  Clock,
  Award,
  FileText,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const initialEventForm = {
  id: "",
  name: "",
  start_time: "",
  end_time: "",
  roundsJson: "[]",
};

const initialCoordinatorForm = {
  eventId: "",
  roundId: "",
  panelId: "",
  ecell_member_id: "",
  start_time: "",
  end_time: "",
};

const initialPromotionForm = {
  eventId: "",
  roundId: "",
  from_round_id: "",
  emailsCsv: "",
};

const initialCreateSlotsForm = {
  eventId: "",
  roundId: "",
  panel_id: "",
  start_time: "",
  slot_duration_min: "",
  slot_count: "",
  capacity_per_slot: "",
};

const initialRandomAssignForm = {
  eventId: "",
  roundId: "",
  panel_id: "",
  seed: "",
};

const parseRoundsInput = (roundsJson) => {
  if (!roundsJson?.trim()) {
    return [];
  }
  const parsed = JSON.parse(roundsJson);
  if (!Array.isArray(parsed)) {
    throw new Error("Rounds input must be a JSON array");
  }
  return parsed;
};

const parseEmails = (csv) => {
  return csv
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString();
};

export default function EventOperations() {
  const [statusFilter, setStatusFilter] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [eventForm, setEventForm] = useState(initialEventForm);
  const [coordinatorForm, setCoordinatorForm] = useState(initialCoordinatorForm);
  const [promotionForm, setPromotionForm] = useState(initialPromotionForm);
  const [createSlotsForm, setCreateSlotsForm] = useState(initialCreateSlotsForm);
  const [randomAssignForm, setRandomAssignForm] = useState(initialRandomAssignForm);

  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Expand/collapse state for each section
  const [expandedSections, setExpandedSections] = useState({
    eventsList: true,
    eventDetails: true,
    promotions: true,
    createUpdateEvent: true,
    assignCoordinator: true,
    createOfflineSlots: true,
    assignRandomSlots: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const statusOptions = useMemo(() => ["", "upcoming", "live", "completed"], []);

  const fetchEvents = useCallback(async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError("");
      const response = await endeavourApiClient.getEvents(statusFilter || undefined);
      const list = response?.events || response?.data?.events || [];
      setEvents(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Unable to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchEvents({ showLoader: true });
  }, [fetchEvents]);

  const openEventDetail = async (eventId) => {
    if (!eventId) return;
    try {
      setDetailLoading(true);
      setError("");
      const response = await endeavourApiClient.getEventById(eventId);
      setSelectedEventId(eventId);
      setSelectedEventDetail(response?.data || null);
    } catch (err) {
      setError(err?.message || "Unable to fetch event details");
      setSelectedEventDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const runAction = async (actionName, callback) => {
    try {
      setActionLoading(actionName);
      setError("");
      setSuccess("");
      const response = await callback();
      setSuccess(response?.message || `${actionName} completed successfully`);
      await fetchEvents({ showLoader: false });
      if (selectedEventId) {
        await openEventDetail(selectedEventId);
      }
      return response;
    } catch (err) {
      setError(err?.message || `${actionName} failed`);
      return null;
    } finally {
      setActionLoading("");
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.id.trim() || !eventForm.name.trim()) {
      setError("Event ID and Name are required for creation");
      return;
    }
    let rounds;
    try {
      rounds = parseRoundsInput(eventForm.roundsJson);
    } catch (err) {
      setError(`Invalid rounds JSON: ${err.message}`);
      return;
    }
    const payload = {
      id: eventForm.id.trim(),
      name: eventForm.name.trim(),
      start_time: eventForm.start_time,
      end_time: eventForm.end_time,
      rounds,
    };
    await runAction("create_event", async () => endeavourApiClient.createEvent(payload));
  };

  const handleUpdateEvent = async () => {
    if (!eventForm.id.trim()) {
      setError("Event ID is required for update");
      return;
    }
    let rounds;
    try {
      rounds = parseRoundsInput(eventForm.roundsJson);
    } catch (err) {
      setError(`Invalid rounds JSON: ${err.message}`);
      return;
    }
    const payload = {
      name: eventForm.name.trim(),
      start_time: eventForm.start_time,
      end_time: eventForm.end_time,
      rounds,
    };
    await runAction("update_event", async () =>
      endeavourApiClient.updateEvent(eventForm.id.trim(), payload)
    );
  };

  const handleAssignCoordinator = async () => {
    const { eventId, roundId, panelId, ecell_member_id, start_time, end_time } = coordinatorForm;
    if (!eventId || !roundId || !panelId || !ecell_member_id) {
      setError("Event ID, Round ID, Panel ID and E-Cell Member ID are required");
      return;
    }
    const payload = { ecell_member_id: ecell_member_id.trim(), start_time, end_time };
    await runAction("assign_coordinator", async () =>
      endeavourApiClient.assignPanelCoordinator(eventId.trim(), roundId.trim(), panelId.trim(), payload)
    );
  };

  const handlePromotions = async () => {
    const { eventId, roundId, from_round_id, emailsCsv } = promotionForm;
    if (!eventId || !roundId) {
      setError("Event ID and Round ID are required");
      return;
    }
    const emails = parseEmails(emailsCsv);
    if (emails.length === 0) {
      setError("At least one email is required for promotion");
      return;
    }
    const payload = {
      ...(from_round_id.trim() ? { from_round_id: from_round_id.trim() } : {}),
      emails,
    };
    await runAction("promote_round", async () =>
      endeavourApiClient.promoteRoundByEmails(eventId.trim(), roundId.trim(), payload)
    );
  };

  const handleCreateSlots = async () => {
    const { eventId, roundId, panel_id, start_time, slot_duration_min, slot_count, capacity_per_slot } = createSlotsForm;
    if (!eventId || !roundId || !start_time) {
      setError("Event ID, Round ID and Start Time are required");
      return;
    }
    const payload = {
      ...(panel_id.trim() ? { panel_id: panel_id.trim() } : {}),
      start_time,
      slot_duration_min: Number(slot_duration_min),
      slot_count: Number(slot_count),
      capacity_per_slot: Number(capacity_per_slot),
    };
    await runAction("create_slots", async () =>
      endeavourApiClient.createOfflineSlots(eventId.trim(), roundId.trim(), payload)
    );
  };

  const handleAssignRandomSlots = async () => {
    const { eventId, roundId, panel_id, seed } = randomAssignForm;
    if (!eventId || !roundId) {
      setError("Event ID and Round ID are required");
      return;
    }
    const payload = {
      ...(panel_id.trim() ? { panel_id: panel_id.trim() } : {}),
      ...(seed !== "" ? { seed: Number(seed) } : {}),
    };
    await runAction("assign_random_slots", async () =>
      endeavourApiClient.assignRandomSlots(eventId.trim(), roundId.trim(), payload)
    );
  };

  // Helper to render a collapsible section
  const CollapsibleSection = ({ id, title, endpoint, children }) => {
    const isExpanded = expandedSections[id];
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
        >
          <div className="text-left">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {endpoint && <p className="mt-1 text-xs text-slate-500">{endpoint}</p>}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-500" />
          )}
        </button>
        {isExpanded && <div className="px-5 pb-5">{children}</div>}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Event Operations</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage events, rounds, coordinators, promotions, and offline slots
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status || "all"} value={status}>
                  {status || "All events"}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchEvents({ showLoader: false })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Events List Section */}
          <CollapsibleSection id="eventsList" title="Events" endpoint="GET /events & GET /events/{event_id}">
            {loading ? (
              <div className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-600">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
                No events found.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => openEventDetail(event.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedEventId === event.id
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-medium">{event.name || event.id}</p>
                    <p className="mt-0.5 text-xs opacity-80">{event.id}</p>
                  </button>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Event Details Section */}
          <CollapsibleSection id="eventDetails" title="Event Details" endpoint="GET /events/{event_id} (structured)">
            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : selectedEventDetail ? (
              <div className="space-y-5">
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="mb-2 text-md font-medium text-slate-800">Information</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <Tag className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Event ID</p>
                        <p className="text-sm font-medium">{selectedEventDetail.event?.id || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="text-sm font-medium">{selectedEventDetail.event?.name || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Start Time</p>
                        <p className="text-sm">{formatDateTime(selectedEventDetail.event?.start_time)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">End Time</p>
                        <p className="text-sm">{formatDateTime(selectedEventDetail.event?.end_time)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Venue</p>
                        <p className="text-sm">{selectedEventDetail.event?.venue || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Max Capacity</p>
                        <p className="text-sm">{selectedEventDetail.event?.max_capacity ?? "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Award className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Team Event</p>
                        <p className="text-sm">{selectedEventDetail.event?.is_team_event ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    {selectedEventDetail.event?.is_team_event && (
                      <div className="flex items-start gap-2">
                        <Users className="mt-0.5 h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Team Size</p>
                          <p className="text-sm">
                            {selectedEventDetail.event?.min_team_size} - {selectedEventDetail.event?.max_team_size}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <LinkIcon className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Mode</p>
                        <p className="text-sm capitalize">{selectedEventDetail.event?.mode || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="text-sm">₹{selectedEventDetail.event?.price ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  {selectedEventDetail.event?.description && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-xs text-slate-500">Description</p>
                      <p className="text-sm">{selectedEventDetail.event.description}</p>
                    </div>
                  )}
                  {selectedEventDetail.event?.rules_url && (
                    <div className="mt-2">
                      <a
                        href={selectedEventDetail.event.rules_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <FileText className="h-3 w-3" /> Rules & Guidelines
                      </a>
                    </div>
                  )}
                </div>
                {selectedEventDetail.rounds && selectedEventDetail.rounds.length > 0 && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <h3 className="mb-3 text-md font-medium text-slate-800">Rounds & Panels</h3>
                    <div className="space-y-4">
                      {selectedEventDetail.rounds.map((item, idx) => (
                        <div key={item.round?.id || idx} className="border-b border-slate-200 pb-3 last:border-0">
                          <div className="flex flex-wrap items-baseline justify-between">
                            <h4 className="font-semibold text-slate-900">
                              {item.round?.name} <span className="text-xs text-slate-500">(Seq: {item.round?.sequence})</span>
                            </h4>
                            <span className="text-xs capitalize text-slate-600">{item.round?.mode}</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            {formatDateTime(item.round?.starts_at)} — {formatDateTime(item.round?.ends_at)}
                          </div>
                          {item.panels && item.panels.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-slate-700">Panels:</p>
                              <ul className="mt-1 list-inside list-disc text-xs text-slate-600">
                                {item.panels.map((panel) => (
                                  <li key={panel.id}>{panel.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
                Select an event from the list to view its structured details.
              </div>
            )}
          </CollapsibleSection>

          {/* Promotions Section (left column) */}
          <CollapsibleSection id="promotions" title="Promotions" endpoint="POST /events/{event_id}/rounds/{round_id}/promotions">
            <div className="grid gap-3">
              <input
                placeholder="Event ID"
                value={promotionForm.eventId}
                onChange={(e) => setPromotionForm((prev) => ({ ...prev, eventId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Target Round ID"
                value={promotionForm.roundId}
                onChange={(e) => setPromotionForm((prev) => ({ ...prev, roundId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="From Round ID (optional)"
                value={promotionForm.from_round_id}
                onChange={(e) => setPromotionForm((prev) => ({ ...prev, from_round_id: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Emails (comma separated)"
                value={promotionForm.emailsCsv}
                onChange={(e) => setPromotionForm((prev) => ({ ...prev, emailsCsv: e.target.value }))}
                className="min-h-[80px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handlePromotions}
              disabled={actionLoading === "promote_round"}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {actionLoading === "promote_round" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Promote by Emails
            </button>
          </CollapsibleSection>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Create / Update Event */}
          <CollapsibleSection id="createUpdateEvent" title="Create / Update Event" endpoint="POST /events & PUT /events/{event_id}">
            <div className="grid gap-3">
              <input
                placeholder="Event ID * (required for both)"
                value={eventForm.id}
                onChange={(e) => setEventForm((prev) => ({ ...prev, id: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Name *"
                value={eventForm.name}
                onChange={(e) => setEventForm((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={eventForm.start_time}
                onChange={(e) => setEventForm((prev) => ({ ...prev, start_time: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={eventForm.end_time}
                onChange={(e) => setEventForm((prev) => ({ ...prev, end_time: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                placeholder='Rounds JSON array, e.g. [{"name":"Screening","sequence":1,"mode":"online","starts_at":"2026-04-10T09:00:00Z","ends_at":"2026-04-10T12:00:00Z"}]'
                value={eventForm.roundsJson}
                onChange={(e) => setEventForm((prev) => ({ ...prev, roundsJson: e.target.value }))}
                className="min-h-[110px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleCreateEvent}
                disabled={actionLoading === "create_event"}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {actionLoading === "create_event" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                Create Event
              </button>
              <button
                onClick={handleUpdateEvent}
                disabled={actionLoading === "update_event"}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {actionLoading === "update_event" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Update Event
              </button>
            </div>
          </CollapsibleSection>

          {/* Assign Coordinator */}
          <CollapsibleSection id="assignCoordinator" title="Assign Coordinator" endpoint="POST /events/{event_id}/rounds/{round_id}/panels/{panel_id}/coordinators">
            <div className="grid gap-3">
              <input
                placeholder="Event ID"
                value={coordinatorForm.eventId}
                onChange={(e) => setCoordinatorForm((prev) => ({ ...prev, eventId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Round ID"
                value={coordinatorForm.roundId}
                onChange={(e) => setCoordinatorForm((prev) => ({ ...prev, roundId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Panel ID"
                value={coordinatorForm.panelId}
                onChange={(e) => setCoordinatorForm((prev) => ({ ...prev, panelId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="E-Cell Member ID"
                value={coordinatorForm.ecell_member_id}
                onChange={(e) => setCoordinatorForm((prev) => ({ ...prev, ecell_member_id: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={coordinatorForm.start_time}
                onChange={(e) => setCoordinatorForm((prev) => ({ ...prev, start_time: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={coordinatorForm.end_time}
                onChange={(e) => setCoordinatorForm((prev) => ({ ...prev, end_time: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleAssignCoordinator}
              disabled={actionLoading === "assign_coordinator"}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {actionLoading === "assign_coordinator" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
              Assign Coordinator
            </button>
          </CollapsibleSection>

          {/* Create Offline Slots (right column) */}
          <CollapsibleSection id="createOfflineSlots" title="Create Offline Slots" endpoint="POST /events/{event_id}/rounds/{round_id}/slots">
            <div className="grid gap-3">
              <input
                placeholder="Event ID"
                value={createSlotsForm.eventId}
                onChange={(e) => setCreateSlotsForm((prev) => ({ ...prev, eventId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Round ID"
                value={createSlotsForm.roundId}
                onChange={(e) => setCreateSlotsForm((prev) => ({ ...prev, roundId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Panel ID (optional)"
                value={createSlotsForm.panel_id}
                onChange={(e) => setCreateSlotsForm((prev) => ({ ...prev, panel_id: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={createSlotsForm.start_time}
                onChange={(e) => setCreateSlotsForm((prev) => ({ ...prev, start_time: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Slot Duration (minutes)"
                value={createSlotsForm.slot_duration_min}
                onChange={(e) => setCreateSlotsForm((prev) => ({ ...prev, slot_duration_min: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Slot Count"
                value={createSlotsForm.slot_count}
                onChange={(e) => setCreateSlotsForm((prev) => ({ ...prev, slot_count: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Capacity per Slot"
                value={createSlotsForm.capacity_per_slot}
                onChange={(e) => setCreateSlotsForm((prev) => ({ ...prev, capacity_per_slot: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleCreateSlots}
              disabled={actionLoading === "create_slots"}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {actionLoading === "create_slots" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              Create Slots
            </button>
          </CollapsibleSection>

          {/* Assign Random Slots (right column) */}
          <CollapsibleSection id="assignRandomSlots" title="Assign Random Slots" endpoint="POST /events/{event_id}/rounds/{round_id}/slots/assign-random">
            <div className="grid gap-3">
              <input
                placeholder="Event ID"
                value={randomAssignForm.eventId}
                onChange={(e) => setRandomAssignForm((prev) => ({ ...prev, eventId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Round ID"
                value={randomAssignForm.roundId}
                onChange={(e) => setRandomAssignForm((prev) => ({ ...prev, roundId: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Panel ID (optional)"
                value={randomAssignForm.panel_id}
                onChange={(e) => setRandomAssignForm((prev) => ({ ...prev, panel_id: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Random Seed (optional)"
                value={randomAssignForm.seed}
                onChange={(e) => setRandomAssignForm((prev) => ({ ...prev, seed: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleAssignRandomSlots}
              disabled={actionLoading === "assign_random_slots"}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {actionLoading === "assign_random_slots" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Assign Random Slots
            </button>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}