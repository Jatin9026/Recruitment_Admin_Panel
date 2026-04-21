import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, ShieldPlus, ShieldX } from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const roleSuggestions = [
  "ADMIN ACCESS",
  "SUPERADMIN ACCESS",
  "EVENT MANAGER ACCESS",
  "ATTENDANCE COORDINATOR ACCESS",
  "KIT COORDINATOR ACCESS",
  "CONTENT MANAGER ACCESS",
  "admin",
  "superadmin",
  "event_manager",
  "attendance_coordinator",
  "kit_coordinator",
  "content_manager",
];

export default function RolesAndAccess() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => {
    return Boolean(email.trim() && role.trim() && !loadingAction);
  }, [email, role, loadingAction]);

  const runRoleAction = async (actionType) => {
    if (!canSubmit) {
      return;
    }

    try {
      setLoadingAction(actionType);
      setError("");
      setSuccess("");

      const payloadEmail = email.trim().toLowerCase();
      const payloadRole = role.trim();

      const response =
        actionType === "grant"
          ? await endeavourApiClient.grantRole(payloadEmail, payloadRole)
          : await endeavourApiClient.revokeRole(payloadEmail, payloadRole);

      setSuccess(response?.message || `Role ${actionType}ed successfully.`);
    } catch (err) {
      setError(err?.message || `Failed to ${actionType} role.`);
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Roles and Access</h1>
        <p className="mt-1 text-sm text-slate-600">Integrated with POST /api/v1/admin/roles/grant and POST /api/v1/admin/roles/revoke</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Target Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="member@example.com"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Role Value</span>
            <input
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              list="endeavour-role-suggestions"
              placeholder="ADMIN ACCESS"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            />
            <datalist id="endeavour-role-suggestions">
              {roleSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Backend may validate specific role/access strings. If an operation fails with 400, use the exact value expected by backend role parsing rules.
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => runRoleAction("grant")}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "grant" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4" />}
            Grant Role
          </button>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => runRoleAction("revoke")}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "revoke" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4" />}
            Revoke Role
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Role action failed</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Success</p>
                <p className="mt-1 text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
