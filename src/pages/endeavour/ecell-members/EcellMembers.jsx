import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Briefcase, CalendarDays, Eye, GraduationCap, Link2, Mail, Phone, RefreshCw, Search, ShieldX, Users, X } from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const getDisplayValue = (value, fallback = "Not provided") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
};

const formatDateValue = (value) => {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function EcellMembers() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingEmail, setRemovingEmail] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchMembers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");
      const response = await endeavourApiClient.getEcellMembers();
      const list = response?.data?.members || [];
      setMembers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Unable to fetch ecell members");
      setMembers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const baseList = query
      ? members.filter((member) => {
          return (
            member?.name?.toLowerCase().includes(query) ||
            member?.email?.toLowerCase().includes(query) ||
            member?.year?.toString().toLowerCase().includes(query) ||
            member?.account_type?.toLowerCase().includes(query) ||
            member?.position?.toLowerCase().includes(query)
          );
        })
      : members;

    return [...baseList].sort((a, b) => {
      const yearA = Number(a?.year);
      const yearB = Number(b?.year);
      const safeYearA = Number.isFinite(yearA) ? yearA : -1;
      const safeYearB = Number.isFinite(yearB) ? yearB : -1;

      if (safeYearA === safeYearB) {
        return (a?.name || "").localeCompare(b?.name || "");
      }

      return safeYearB - safeYearA;
    });
  }, [members, searchTerm]);

  useEffect(() => {
    setShowTechnicalDetails(false);

    if (!selectedMember) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedMember(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedMember]);

  const handleRemoveAccess = async (email) => {
    if (!email) {
      return;
    }

    const shouldProceed = window.confirm(`Remove ecell access for ${email}?`);
    if (!shouldProceed) {
      return;
    }

    try {
      setRemovingEmail(email);
      setError("");
      setSuccessMessage("");
      const response = await endeavourApiClient.removeEcellMember(email);
      setSuccessMessage(response?.message || "Ecell member access removed successfully");
      await fetchMembers(false);
    } catch (err) {
      setError(err?.message || "Failed to remove member access");
    } finally {
      setRemovingEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Ecell Members</h1>
            <p className="mt-1 text-sm text-slate-600">Integrated with GET /api/v1/ecell/ecell-members and POST /api/v1/admin/ecell-members/remove</p>
          </div>

          <button
            type="button"
            onClick={() => fetchMembers(false)}
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
            placeholder="Search by name, email, access type, account type, position"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
          />
        </div>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</div>
      )}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm text-slate-600">Loading members...</p>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Unable to load members</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px]">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Account Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id || member.email} className="border-t border-slate-200 text-sm text-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-900">{member.name || "-"}</td>
                      <td className="px-4 py-3">{member.email || "-"}</td>
                      <td className="px-4 py-3">{member.year || "-"}</td>
                      <td className="px-4 py-3">{member.account_type || "-"}</td>
                      <td className="px-4 py-3">{member.status || "-"}</td>
                      <td className="px-4 py-3">{member.domain || "-"}</td>
                      <td className="px-4 py-3">{member.position || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedMember(member)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          <button
                            type="button"
                            disabled={removingEmail === member.email}
                            onClick={() => handleRemoveAccess(member.email)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ShieldX className="h-4 w-4" />
                            {removingEmail === member.email ? "Removing..." : "Remove From Ecell"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]" onClick={() => setSelectedMember(null)}>
          <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-white px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Member Details</h2>
                <p className="mt-1 text-sm text-slate-600">{selectedMember.name || selectedMember.email || "Ecell Member"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">Year {selectedMember.year || "-"}</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{selectedMember.status || "Unknown Status"}</span>
                  <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{selectedMember.account_type || "Account Type"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
                <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-3">
                    {selectedMember.profile_pic ? (
                      <img src={selectedMember.profile_pic} alt={selectedMember.name || "Member"} className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-lg font-semibold text-slate-700">
                        {(selectedMember.name || selectedMember.email || "M").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{selectedMember.name || "-"}</p>
                      <p className="text-xs text-slate-500">{selectedMember.email || "No email"}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Primary Role</p>
                      <p className="mt-1 text-sm text-slate-800">{getDisplayValue(selectedMember.account_type)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Domain</p>
                      <p className="mt-1 text-sm text-slate-800">{getDisplayValue(selectedMember.domain)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Position</p>
                      <p className="mt-1 text-sm text-slate-800">{getDisplayValue(selectedMember.position)}</p>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {selectedMember.email && (
                        <a
                          href={`mailto:${selectedMember.email}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Mail className="h-4 w-4" />
                          Email Member
                        </a>
                      )}
                      {selectedMember.phone_number && (
                        <a
                          href={`tel:${selectedMember.phone_number}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Phone className="h-4 w-4" />
                          Call Member
                        </a>
                      )}
                    </div>
                  </div>
                </aside>

                <div className="space-y-4">
                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-500" />
                      <h3 className="text-sm font-semibold text-slate-900">Academic Details</h3>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Year</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.year)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Library ID</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.library_id)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">University Roll No</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.university_roll_no)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Accommodation</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.accommodation_type)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-500" />
                      <h3 className="text-sm font-semibold text-slate-900">Role And Access</h3>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Account Type</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.account_type)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Access Type</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.access_type)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.status)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-500" />
                      <h3 className="text-sm font-semibold text-slate-900">Personal And Contact</h3>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date of Birth</dt>
                        <dd className="mt-1 text-sm text-slate-900">{formatDateValue(selectedMember.dob)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone Number</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.phone_number)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                        <dd className="mt-1 break-all text-sm text-slate-900">{getDisplayValue(selectedMember.email)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">KIET Email</dt>
                        <dd className="mt-1 break-all text-sm text-slate-900">{getDisplayValue(selectedMember.kiet_email)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">City</dt>
                        <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.city)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-slate-500" />
                      <h3 className="text-sm font-semibold text-slate-900">Links</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {selectedMember.portfolio_url ? (
                        <a href={selectedMember.portfolio_url} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-emerald-700 underline decoration-emerald-300 underline-offset-2">
                          Portfolio
                        </a>
                      ) : null}
                      {selectedMember.linkedin_url ? (
                        <a href={selectedMember.linkedin_url} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-emerald-700 underline decoration-emerald-300 underline-offset-2">
                          LinkedIn
                        </a>
                      ) : null}
                      {selectedMember.instagram_url ? (
                        <a href={selectedMember.instagram_url} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-emerald-700 underline decoration-emerald-300 underline-offset-2">
                          Instagram
                        </a>
                      ) : null}
                      {!selectedMember.portfolio_url && !selectedMember.linkedin_url && !selectedMember.instagram_url ? (
                        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">No social or portfolio links provided.</p>
                      ) : null}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <button
                      type="button"
                      onClick={() => setShowTechnicalDetails((prev) => !prev)}
                      className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-2"
                    >
                      {showTechnicalDetails ? "Hide technical metadata" : "Show technical metadata"}
                    </button>

                    {showTechnicalDetails && (
                      <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Member ID</dt>
                          <dd className="mt-1 break-all text-sm text-slate-900">{getDisplayValue(selectedMember.id)}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Document ID</dt>
                          <dd className="mt-1 break-all text-sm text-slate-900">{getDisplayValue(selectedMember.doc_id)}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stability</dt>
                          <dd className="mt-1 text-sm text-slate-900">{getDisplayValue(selectedMember.stability)}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Created On</dt>
                          <dd className="mt-1 text-sm text-slate-900">{formatDateValue(selectedMember.created_on)}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Updated On</dt>
                          <dd className="mt-1 text-sm text-slate-900">{formatDateValue(selectedMember.updated_on)}</dd>
                        </div>
                      </dl>
                    )}
                  </section>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white/90 px-6 py-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
