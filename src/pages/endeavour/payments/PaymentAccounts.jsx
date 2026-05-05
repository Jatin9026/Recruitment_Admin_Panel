import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  Loader2,
  RefreshCw,
  RotateCcw,
  Shield,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

const getUsage = (account) => Number(account?.current_usage ?? account?.CurrentUsage ?? 0);
const getSuccessfulUsage = (account) => Number(account?.successful_usage ?? account?.SuccessfulUsage ?? 0);
const getCooldownUntil = (account) => account?.cooldown_until ?? account?.CooldownUntil ?? null;

export default function PaymentAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedAccountId, setCopiedAccountId] = useState("");

  const fetchAccounts = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");
      const response = await endeavourApiClient.getPaymentAccounts();
      const list = response?.accounts || [];
      setAccounts(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Unable to load payment accounts.");
      setAccounts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const stats = useMemo(() => {
    return accounts.reduce(
      (acc, account) => {
        const status = String(account?.status || "").toLowerCase();
        const usage = getUsage(account);
        const limit = Number(account?.max_limit || 0);

        acc.total += 1;
        acc.active += status === "active" ? 1 : 0;
        acc.used += usage;
        acc.successful += getSuccessfulUsage(account);
        acc.remaining += Math.max(limit - usage, 0);
        acc.cooldown += getCooldownUntil(account) ? 1 : 0;
        return acc;
      },
      { total: 0, active: 0, used: 0, successful: 0, remaining: 0, cooldown: 0 }
    );
  }, [accounts]);

  const handleResetUsage = async () => {
    const shouldContinue = window.confirm("Reset usage counters for all active QR accounts?");
    if (!shouldContinue) {
      return;
    }

    try {
      setResetting(true);
      setError("");
      setSuccess("");
      const response = await endeavourApiClient.resetPaymentQrUsage();
      setSuccess(response?.message || "QR usage counters reset successfully.");
      await fetchAccounts({ showLoader: false });
    } catch (err) {
      setError(err?.message || "Failed to reset QR usage counters.");
    } finally {
      setResetting(false);
    }
  };

  const handleCopy = async (accountId, uri) => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopiedAccountId(accountId);
      setSuccess("QR payload copied to clipboard.");
      window.setTimeout(() => setCopiedAccountId(""), 1800);
    } catch {
      setError("Unable to copy QR payload.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-lg font-medium text-slate-700">Loading payment accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl space-y-6"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Payment Accounts</h1>
                  <p className="mt-1 text-sm text-slate-600">Monitor the live QR payloads and reset usage counters when needed.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fetchAccounts({ showLoader: false })}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={handleResetUsage}
                disabled={resetting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                {resetting ? "Resetting..." : "Reset Active QR Usage"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="QR Accounts" value={stats.total} icon={WalletCards} accent="slate" />
          <StatCard title="Active" value={stats.active} icon={Shield} accent="emerald" />
          <StatCard title="Usage" value={stats.used} icon={CircleDollarSign} accent="blue" />
          <StatCard title="Cooldowns" value={stats.cooldown} icon={Clock3} accent="amber" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Live QR Accounts</h2>
                <p className="text-sm text-slate-600">Each card renders the current UPI payload as a scannable QR code.</p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <Sparkles className="h-4 w-4" />
                Live data from /admin/payments/accounts
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
            {accounts.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <WalletCards className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <h3 className="text-base font-medium text-slate-900">No payment accounts found</h3>
                <p className="mt-1 text-sm text-slate-500">Refresh the page to check for updated QR account data.</p>
              </div>
            ) : (
              accounts.map((account) => {
                const uri = account.qr_image_url || "";
                const usage = getUsage(account);
                const limit = Number(account.max_limit || 0);
                const remaining = Math.max(limit - usage, 0);
                const accountId = account.id;
                const cooldownUntil = getCooldownUntil(account);
                const active = String(account.status || "").toLowerCase() === "active";

                return (
                  <div key={accountId} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{account.upi_id || "Unknown UPI ID"}</h3>
                            <StatusBadge active={active} />
                          </div>
                          <p className="mt-1 text-sm text-slate-500">Created {formatDateTime(account.created_at)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                          <InfoPill label="Max Limit" value={limit} />
                          <InfoPill label="Current Usage" value={usage} />
                          <InfoPill label="Successful" value={getSuccessfulUsage(account)} />
                          <InfoPill label="Remaining" value={remaining} />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                          <p className="font-medium text-slate-700">Cooldown</p>
                          <p className="mt-1">{cooldownUntil ? formatDateTime(cooldownUntil) : "No cooldown active"}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex min-h-[220px] min-w-[220px] items-center justify-center rounded-xl bg-white p-3">
                          {uri ? (
                            <QRCodeSVG value={uri} size={190} level="M" includeMargin />
                          ) : (
                            <div className="text-center text-sm text-slate-500">No QR payload available</div>
                          )}
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-600">
                            {uri || "N/A"}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(accountId, uri)}
                              disabled={!uri}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {copiedAccountId === accountId ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                              {copiedAccountId === accountId ? "Copied" : "Copy QR Payload"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, accent = "slate" }) {
  const accentClasses = {
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses[accent] || accentClasses.slate}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}