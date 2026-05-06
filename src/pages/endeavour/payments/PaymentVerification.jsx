import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  ChevronDown,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Clock3,
  XCircle,
  IndianRupee,
  SlidersHorizontal,
} from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const UPI_IDS = [
  "8869927409@ptsbi",
  "8869927409@airtel",
  "8869927409@slc",
  "yashjiobank@ibl",
  "9984444892@ibl",
  "8171445434@ptyes",
  "9984444892-2@axl",
  "8171445434@slc",
];

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

const formatCurrency = (amount, currency = "INR") => {
  const numericAmount = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `${currency || "INR"} ${numericAmount}`;
  }
};

const shortId = (value) => {
  if (!value) return "—";
  return value.length > 10 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
};

export default function PaymentVerification() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUpiId, setSelectedUpiId] = useState("");
  const [upiDropdownOpen, setUpiDropdownOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchOrders = async ({ showLoader = true, upiId = selectedUpiId } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await endeavourApiClient.getPendingVerificationOrders(
        upiId ? { upi_id: upiId } : {}
      );
      const list = response?.data || response?.orders || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Unable to load pending verification orders.");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders({ showLoader: true, upiId: selectedUpiId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUpiId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!upiDropdownOpen) return;
    const handler = (e) => {
      if (!e.target.closest("#upi-dropdown-root")) {
        setUpiDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [upiDropdownOpen]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) => {
      const haystack = [
        order.id,
        order.event_id,
        order.user_id,
        order.user_name,
        order.upi_id,
        order.utr_number,
        order.payment_mode,
        order.verification_status,
        order.provider,
        order.assigned_account_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [orders, searchTerm]);

  const stats = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        acc.total += 1;
        acc.amount += Number(order.amount || 0);
        acc.manual += order.verification_method === "manual_utr" ? 1 : 0;
        acc.cash += String(order.payment_mode || "").toLowerCase() === "cash" ? 1 : 0;
        acc.inProgress += order.verification_status === "verification_in_progress" ? 1 : 0;
        return acc;
      },
      { total: 0, amount: 0, manual: 0, cash: 0, inProgress: 0 }
    );
  }, [filteredOrders]);

  const handleVerify = async (orderId) => {
    try {
      setActionLoading(orderId);
      setError("");
      setSuccess("");
      await endeavourApiClient.verifyOrder(orderId, "approve");
      setSuccess("Verification completed successfully.");
      await fetchOrders({ showLoader: false });
    } catch (err) {
      setError(err?.message || "Verification failed.");
    } finally {
      setActionLoading("");
    }
  };

  const handleCashCollect = async (orderId) => {
    const shouldContinue = window.confirm("Collect cash and generate tickets for this order?");
    if (!shouldContinue) return;

    try {
      setActionLoading(orderId);
      setError("");
      setSuccess("");
      await endeavourApiClient.collectCashOrder(orderId);
      setSuccess("Cash collection completed successfully.");
      await fetchOrders({ showLoader: false });
    } catch (err) {
      setError(err?.message || "Cash collection failed.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-lg font-medium text-slate-700">Loading pending verifications...</p>
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
        {/* ── Header ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Payment Verification</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Review pending manual orders and process verification or cash collection.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* ── UPI ID Filter Dropdown ── */}
              <div id="upi-dropdown-root" className="relative">
                <button
                  type="button"
                  onClick={() => setUpiDropdownOpen((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition
                    ${selectedUpiId
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {selectedUpiId ? (
                    <span className="max-w-[160px] truncate">{selectedUpiId}</span>
                  ) : (
                    "Filter by UPI ID"
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${upiDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {upiDropdownOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Select UPI Account
                      </p>
                    </div>
                    <ul className="max-h-64 overflow-y-auto py-1">
                      {/* "All" option */}
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUpiId("");
                            setUpiDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-slate-50
                            ${!selectedUpiId ? "font-semibold text-emerald-700" : "text-slate-700"}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${!selectedUpiId ? "bg-emerald-500" : "bg-transparent border border-slate-300"}`} />
                          All UPI IDs
                        </button>
                      </li>
                      {UPI_IDS.map((upi) => (
                        <li key={upi}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUpiId(upi);
                              setUpiDropdownOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-mono transition hover:bg-slate-50
                              ${selectedUpiId === upi ? "font-semibold text-emerald-700" : "text-slate-700"}`}
                          >
                            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${selectedUpiId === upi ? "bg-emerald-500" : "bg-transparent border border-slate-300"}`} />
                            {upi}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ── Refresh ── */}
              <button
                type="button"
                onClick={() => fetchOrders({ showLoader: false })}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              {/* ── Search ── */}
              <div className="relative min-w-[260px] flex-1 lg:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search order, UTR, user, UPI..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>
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

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="Pending Orders" value={stats.total} icon={ReceiptText} accent="emerald" />
          <StatCard title="Manual Orders" value={stats.manual} icon={Banknote} accent="slate" />
          <StatCard title="Cash Orders" value={stats.cash} icon={IndianRupee} accent="amber" />
          <StatCard title="Amount Total" value={formatCurrency(stats.amount)} icon={Clock3} accent="blue" compact />
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Pending Verification Orders</h2>
                <p className="text-sm text-slate-600">
                  Showing {filteredOrders.length} orders
                  {selectedUpiId && (
                    <span className="ml-1 font-medium text-emerald-700">
                      · filtered by <span className="font-mono">{selectedUpiId}</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="text-sm text-slate-500">Live · /admin/orders/pending-verification</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Order</Th>
                  <Th>User / Event</Th>
                  <Th>UPI ID</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Receipt</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <ReceiptText className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                      <h3 className="text-base font-medium text-slate-900">No pending orders found</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Try clearing the search, changing the UPI filter, or refreshing.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const actionBusy = actionLoading === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70">
                        {/* Order */}
                        <Td>
                          <div className="space-y-1">
                            <p className="font-mono text-sm font-medium text-slate-900">{shortId(order.id)}</p>
                            <p className="text-xs text-slate-500">UTR {order.utr_number || "N/A"}</p>
                            <p className="text-xs text-slate-500">{formatDateTime(order.created_at)}</p>
                          </div>
                        </Td>

                        {/* User / Event */}
                        <Td>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">
                              {order.user_name || "Unknown user"}
                            </p>
                            <p className="text-xs text-slate-500">ID {shortId(order.user_id)}</p>
                            <p className="text-xs text-slate-500">Event {order.event_id || "—"}</p>
                            <p className="text-xs text-slate-500">Account {shortId(order.assigned_account_id)}</p>
                          </div>
                        </Td>

                        {/* UPI ID */}
                        <Td>
                          <div className="space-y-1">
                            {order.upi_id ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700">
                                <IndianRupee className="h-3 w-3 text-slate-400" />
                                {order.upi_id}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        </Td>

                        {/* Amount */}
                        <Td>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatCurrency(order.amount, order.currency)}
                            </p>
                            <Badge>{order.payment_mode || "Unknown"}</Badge>
                          </div>
                        </Td>

                        {/* Status */}
                        <Td>
                          <div className="space-y-2">
                            <Badge tone="blue">{order.verification_status || "Unknown"}</Badge>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>Method: {order.verification_method || "N/A"}</span>
                              <span>Attempts: {order.verification_attempts ?? 0}</span>
                            </div>
                          </div>
                        </Td>

                        {/* Receipt */}
                        <Td>
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(order.provider_receipt || null)}
                            disabled={!order.provider_receipt}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ReceiptText className="h-4 w-4" />
                            View
                          </button>
                        </Td>

                        {/* Actions */}
                        <Td>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleVerify(order.id)}
                              disabled={actionBusy}
                              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Verify
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReject(order.id)}
                              disabled={actionBusy}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Reject
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCashCollect(order.id)}
                              disabled={actionBusy}
                              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Banknote className="h-4 w-4" />
                              )}
                              Cash Collect
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Receipt Modal ── */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSelectedReceipt(null)}
          />
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Receipt Preview</h3>
                <p className="text-sm text-slate-500">Preview of the uploaded payment receipt</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-slate-100 p-4 sm:p-6">
              <div className="flex justify-center">
                <img
                  src={selectedReceipt}
                  alt="Receipt preview"
                  className="max-h-[70vh] w-auto max-w-full rounded-xl border border-slate-200 bg-white object-contain shadow-sm"
                />
              </div>
              <div className="mt-4 break-all rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                {selectedReceipt}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ title, value, icon: Icon, accent = "slate", compact = false }) {
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
          <p className={`mt-2 font-semibold text-slate-900 ${compact ? "text-2xl" : "text-3xl"}`}>{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses[accent] || accentClasses.slate}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-6 py-5 align-top text-sm text-slate-700">{children}</td>;
}
