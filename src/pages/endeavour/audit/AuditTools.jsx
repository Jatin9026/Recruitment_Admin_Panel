import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

export default function AuditTools() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePingAudit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await endeavourApiClient.pingAudit();
      setSuccess(response?.message || "Admin action recorded.");
    } catch (err) {
      setError(err?.message || "Unable to ping audit endpoint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Audit Tools</h1>
        <p className="mt-1 text-sm text-slate-600">Integrated with POST /api/v1/admin/audit/ping (superadmin only)</p>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Use this action to verify audit logging pipeline for sensitive admin operations.
        </div>

        <button
          type="button"
          onClick={handlePingAudit}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
          {loading ? "Pinging..." : "Ping Audit Endpoint"}
        </button>

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
    </div>
  );
}
