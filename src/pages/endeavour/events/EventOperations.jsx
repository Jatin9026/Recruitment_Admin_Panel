import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  PlusCircle,
  RefreshCw,
  Settings,
  Sparkles,
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
  slot_duration_min: 20,
  slot_count: 10,
  capacity_per_slot: 2,
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
      const list = response?.data?.events || response?.events || [];
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
    if (!eventId) {
      return;
    }

    try {
      setDetailLoading(true);
      setError("");
      const response = await endeavourApiClient.getEventById(eventId);
      setSelectedEventId(eventId);
      setSelectedEventDetail(response?.data || null);
    } catch (err) {
      setError(err?.message || "Unable to fetch event details");
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
      return response;
    } catch (err) {
      setError(err?.message || `${actionName} failed`);
      return null;
    } finally {
      setActionLoading("");
    }
  };

  const handleCreateEvent = async () => {
    const rounds = parseRoundsInput(eventForm.roundsJson);
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
      setError("Event id is required for update");
      return;
    }

    const rounds = parseRoundsInput(eventForm.roundsJson);
    const payload = {
      name: eventForm.name.trim(),
      start_time: eventForm.start_time,
      end_time: eventForm.end_time,
      rounds,
    };

    await runAction("update_event", async () => endeavourApiClient.updateEvent(eventForm.id.trim(), payload));
  };

  const handleAssignCoordinator = async () => {
    const payload = {
      ecell_member_id: coordinatorForm.ecell_member_id.trim(),
      start_time: coordinatorForm.start_time,
      end_time: coordinatorForm.end_time,
    };

    await runAction("assign_coordinator", async () =>
      endeavourApiClient.assignPanelCoordinator(
        coordinatorForm.eventId.trim(),
        coordinatorForm.roundId.trim(),
        coordinatorForm.panelId.trim(),
        payload
      )
    );
  };

  const handlePromotions = async () => {
    const emails = parseEmails(promotionForm.emailsCsv);
    if (emails.length === 0) {
      setError("At least one email is required for promotion");
      return;
    }

    const payload = {
      ...(promotionForm.from_round_id.trim() ? { from_round_id: promotionForm.from_round_id.trim() } : {}),
      emails,
    };

    await runAction("promote_round", async () =>
      endeavourApiClient.promoteRoundByEmails(promotionForm.eventId.trim(), promotionForm.roundId.trim(), payload)
    );
  };

  const handleCreateSlots = async () => {
    const payload = {
      ...(createSlotsForm.panel_id.trim() ? { panel_id: createSlotsForm.panel_id.trim() } : {}),
      start_time: createSlotsForm.start_time,
      slot_duration_min: Number(createSlotsForm.slot_duration_min),
      slot_count: Number(createSlotsForm.slot_count),
      capacity_per_slot: Number(createSlotsForm.capacity_per_slot),
    };

    await runAction("create_slots", async () =>
      endeavourApiClient.createOfflineSlots(createSlotsForm.eventId.trim(), createSlotsForm.roundId.trim(), payload)
    );
  };

  const handleAssignRandomSlots = async () => {
    const payload = {
      ...(randomAssignForm.panel_id.trim() ? { panel_id: randomAssignForm.panel_id.trim() } : {}),
      ...(randomAssignForm.seed !== "" ? { seed: Number(randomAssignForm.seed) } : {}),
    };

    await runAction("assign_random_slots", async () =>
      endeavourApiClient.assignRandomSlots(randomAssignForm.eventId.trim(), randomAssignForm.roundId.trim(), payload)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Event Operations</h1>
            <p className="mt-1 text-sm text-slate-600">Events list, create, update, coordinator assignment, promotions, slots and random assignment.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status || "all"} value={status}>
                  {status || "all"}
                </option>
              ))}
            </select>

            <button
              type="button"
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

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Events</h2>
          <p className="mt-1 text-xs text-slate-500">GET /events and GET /events/:event_id</p>

          {loading ? (
            <div className="mt-4 rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-600">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="mt-4 rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">No events found.</div>
          ) : (
            <div className="mt-4 space-y-2">
              {events.map((eventItem) => (
                <button
                  key={eventItem.id}
                  type="button"
                  onClick={() => openEventDetail(eventItem.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selectedEventId === eventItem.id
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-medium">{eventItem.name || eventItem.id}</p>
                  <p className="mt-0.5 text-xs opacity-80">{eventItem.id}</p>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800">
              <Settings className="h-4 w-4" />
              Selected Event Detail
            </div>
            {detailLoading ? (
              <p className="text-xs text-slate-600">Loading event detail...</p>
            ) : selectedEventDetail ? (
              <pre className="max-h-72 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                {JSON.stringify(selectedEventDetail, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-slate-600">Select an event to load details.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create / Update Event</h2>
          <p className="mt-1 text-xs text-slate-500">POST /events and PUT /events/:event_id</p>

          <div className="mt-4 grid gap-3">
            <input
              placeholder="event id (required for update)"
              value={eventForm.id}
              onChange={(event) => setEventForm((prev) => ({ ...prev, id: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="name"
              value={eventForm.name}
              onChange={(event) => setEventForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="datetime-local"
              value={eventForm.start_time}
              onChange={(event) => setEventForm((prev) => ({ ...prev, start_time: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="datetime-local"
              value={eventForm.end_time}
              onChange={(event) => setEventForm((prev) => ({ ...prev, end_time: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              placeholder='rounds JSON array, e.g. [{"id":"r1","name":"Round 1"}]'
              value={eventForm.roundsJson}
              onChange={(event) => setEventForm((prev) => ({ ...prev, roundsJson: event.target.value }))}
              className="min-h-[110px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCreateEvent}
              disabled={actionLoading === "create_event"}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {actionLoading === "create_event" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              Create Event
            </button>
            <button
              type="button"
              onClick={handleUpdateEvent}
              disabled={actionLoading === "update_event"}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {actionLoading === "update_event" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Update Event
            </button>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Assign Coordinator</h2>
          <p className="mt-1 text-xs text-slate-500">POST /events/:event_id/rounds/:round_id/panels/:panel_id/coordinators</p>

          <div className="mt-4 grid gap-3">
            <input placeholder="event id" value={coordinatorForm.eventId} onChange={(event) => setCoordinatorForm((prev) => ({ ...prev, eventId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="round id" value={coordinatorForm.roundId} onChange={(event) => setCoordinatorForm((prev) => ({ ...prev, roundId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="panel id" value={coordinatorForm.panelId} onChange={(event) => setCoordinatorForm((prev) => ({ ...prev, panelId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="ecell member id" value={coordinatorForm.ecell_member_id} onChange={(event) => setCoordinatorForm((prev) => ({ ...prev, ecell_member_id: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="datetime-local" value={coordinatorForm.start_time} onChange={(event) => setCoordinatorForm((prev) => ({ ...prev, start_time: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="datetime-local" value={coordinatorForm.end_time} onChange={(event) => setCoordinatorForm((prev) => ({ ...prev, end_time: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <button
            type="button"
            onClick={handleAssignCoordinator}
            disabled={actionLoading === "assign_coordinator"}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {actionLoading === "assign_coordinator" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            Assign Coordinator
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Promotions</h2>
          <p className="mt-1 text-xs text-slate-500">POST /events/:event_id/rounds/:round_id/promotions</p>

          <div className="mt-4 grid gap-3">
            <input placeholder="event id" value={promotionForm.eventId} onChange={(event) => setPromotionForm((prev) => ({ ...prev, eventId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="round id" value={promotionForm.roundId} onChange={(event) => setPromotionForm((prev) => ({ ...prev, roundId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="from round id (optional)" value={promotionForm.from_round_id} onChange={(event) => setPromotionForm((prev) => ({ ...prev, from_round_id: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <textarea placeholder="emails comma separated" value={promotionForm.emailsCsv} onChange={(event) => setPromotionForm((prev) => ({ ...prev, emailsCsv: event.target.value }))} className="min-h-[80px] rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <button
            type="button"
            onClick={handlePromotions}
            disabled={actionLoading === "promote_round"}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {actionLoading === "promote_round" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Promote by Emails
          </button>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create Offline Slots</h2>
          <p className="mt-1 text-xs text-slate-500">POST /events/:event_id/rounds/:round_id/slots</p>

          <div className="mt-4 grid gap-3">
            <input placeholder="event id" value={createSlotsForm.eventId} onChange={(event) => setCreateSlotsForm((prev) => ({ ...prev, eventId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="round id" value={createSlotsForm.roundId} onChange={(event) => setCreateSlotsForm((prev) => ({ ...prev, roundId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="panel id (optional)" value={createSlotsForm.panel_id} onChange={(event) => setCreateSlotsForm((prev) => ({ ...prev, panel_id: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="datetime-local" value={createSlotsForm.start_time} onChange={(event) => setCreateSlotsForm((prev) => ({ ...prev, start_time: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="number" placeholder="slot duration (min)" value={createSlotsForm.slot_duration_min} onChange={(event) => setCreateSlotsForm((prev) => ({ ...prev, slot_duration_min: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="number" placeholder="slot count" value={createSlotsForm.slot_count} onChange={(event) => setCreateSlotsForm((prev) => ({ ...prev, slot_count: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="number" placeholder="capacity per slot" value={createSlotsForm.capacity_per_slot} onChange={(event) => setCreateSlotsForm((prev) => ({ ...prev, capacity_per_slot: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <button
            type="button"
            onClick={handleCreateSlots}
            disabled={actionLoading === "create_slots"}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {actionLoading === "create_slots" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            Create Slots
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Assign Random Slots</h2>
          <p className="mt-1 text-xs text-slate-500">POST /events/:event_id/rounds/:round_id/slots/assign-random</p>

          <div className="mt-4 grid gap-3">
            <input placeholder="event id" value={randomAssignForm.eventId} onChange={(event) => setRandomAssignForm((prev) => ({ ...prev, eventId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="round id" value={randomAssignForm.roundId} onChange={(event) => setRandomAssignForm((prev) => ({ ...prev, roundId: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="panel id (optional)" value={randomAssignForm.panel_id} onChange={(event) => setRandomAssignForm((prev) => ({ ...prev, panel_id: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="number" placeholder="seed (optional)" value={randomAssignForm.seed} onChange={(event) => setRandomAssignForm((prev) => ({ ...prev, seed: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <button
            type="button"
            onClick={handleAssignRandomSlots}
            disabled={actionLoading === "assign_random_slots"}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {actionLoading === "assign_random_slots" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Assign Random Slots
          </button>
        </section>
      </div>
    </div>
  );
}
