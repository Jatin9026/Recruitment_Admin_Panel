import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  ShieldPlus,
  ShieldX,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";
import useEndeavourAuthStore from "../../../store/endeavourAuthStore";
import { ENDEAVOUR_ROLE_RANKS, normalizeEndeavourRole } from "../../../utils/endeavourRoleAccess";

const ROLE_OPTIONS = [
  { label: "SUPER ADMIN ACCESS", value: "SUPER ADMIN ACCESS", roleKey: "superadmin" },
  { label: "ADMIN ACCESS", value: "ADMIN ACCESS", roleKey: "admin" },
  { label: "EVENT MANAGER ACCESS", value: "EVENT MANAGER ACCESS", roleKey: "event_manager" },
  { label: "ATTENDANCE COORDINATOR ACCESS", value: "ATTENDANCE COORDINATOR ACCESS", roleKey: "attendance_coordinator" },
  { label: "KIT COORDINATOR ACCESS", value: "KIT COORDINATOR ACCESS", roleKey: "kit_coordinator" },
  { label: "CONTENT MANAGER ACCESS", value: "CONTENT MANAGER ACCESS", roleKey: "content_manager" },
];

export default function RolesAndAccess() {
  const currentUser = useEndeavourAuthStore((state) => state.user);
  const [allMembers, setAllMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersRefreshing, setMembersRefreshing] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [selectedMemberEmail, setSelectedMemberEmail] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sortMembersByYear = (items = []) => {
    return [...items].sort((a, b) => {
      const yearA = Number(a?.year);
      const yearB = Number(b?.year);
      const safeA = Number.isFinite(yearA) ? yearA : -1;
      const safeB = Number.isFinite(yearB) ? yearB : -1;

      if (safeA === safeB) {
        return (a?.name || "").localeCompare(b?.name || "");
      }

      return safeB - safeA;
    });
  };

  const fetchEligibleMembers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setMembersLoading(true);
      } else {
        setMembersRefreshing(true);
      }

      setMembersError("");
      const response = await endeavourApiClient.getEcellMembers();
      const list = response?.data?.members || [];
      const normalizedList = Array.isArray(list) ? list : [];
      const sortedAllMembers = sortMembersByYear(normalizedList);

      setAllMembers(sortedAllMembers);
      setMembers(sortedAllMembers);
    } catch (err) {
      setAllMembers([]);
      setMembers([]);
      setMembersError(err?.message || "Unable to fetch members");
    } finally {
      setMembersLoading(false);
      setMembersRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEligibleMembers(true);
  }, []);

  useEffect(() => {
    if (members.length === 0) {
      setSelectedMemberEmail("");
      return;
    }

    const selectedStillExists = members.some((member) => member?.email === selectedMemberEmail);
    if (!selectedMemberEmail || !selectedStillExists) {
      setSelectedMemberEmail(members[0]?.email || "");
    }
  }, [members, selectedMemberEmail]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = window.setTimeout(() => setError(""), 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const visibleMembers = useMemo(() => {
    const query = memberSearchTerm.trim().toLowerCase();
    if (!query) {
      return members;
    }

    return members.filter((member) => {
      return (
        member?.name?.toLowerCase().includes(query) ||
        member?.email?.toLowerCase().includes(query) ||
        member?.access_type?.toLowerCase().includes(query) ||
        member?.account_type?.toLowerCase().includes(query) ||
        member?.domain?.toLowerCase().includes(query) ||
        member?.year?.toString().toLowerCase().includes(query)
      );
    });
  }, [members, memberSearchTerm]);

  const selectedMember = useMemo(() => {
    return members.find((member) => member?.email === selectedMemberEmail) || null;
  }, [members, selectedMemberEmail]);

  const memberStats = useMemo(() => {
    const verifiedCount = members.filter((member) => String(member?.status || "").toUpperCase() === "VERIFIED").length;
    const domains = new Set(
      members
        .map((member) => String(member?.domain || "").trim())
        .filter((value) => Boolean(value))
    );

    return {
      total: members.length,
      verified: verifiedCount,
      domains: domains.size,
    };
  }, [members]);

  const membersWithPanelAccess = useMemo(() => {
    const hasAccess = allMembers.filter((member) => {
      const accessType = String(member?.access_type || "").toUpperCase();
      return accessType !== "TEAM ACCESS" && ROLE_OPTIONS.some((option) => option.value === accessType);
    });

    return sortMembersByYear(hasAccess);
  }, [allMembers]);

  const accessRoleBreakdown = useMemo(() => {
    const counts = new Map();

    membersWithPanelAccess.forEach((member) => {
      const accessType = String(member?.access_type || "").toUpperCase();
      if (!accessType) {
        return;
      }
      counts.set(accessType, (counts.get(accessType) || 0) + 1);
    });

    return [...counts.entries()]
      .map(([roleName, count]) => ({ roleName, count }))
      .sort((a, b) => b.count - a.count || a.roleName.localeCompare(b.roleName));
  }, [membersWithPanelAccess]);

  const currentUserRoleKey = useMemo(() => normalizeEndeavourRole(currentUser?.role), [currentUser?.role]);
  const currentUserRoleRank = useMemo(() => ENDEAVOUR_ROLE_RANKS[currentUserRoleKey] || 0, [currentUserRoleKey]);

  const allowedRoleOptions = useMemo(() => {
    return ROLE_OPTIONS.filter((option) => {
      const optionRank = ENDEAVOUR_ROLE_RANKS[option.roleKey] || 0;
      // if user's role rank is higher, they can manage that role and if the user is superadmin then he can manage all roles
      if (currentUserRoleKey === "superadmin") {
        return true;
      }
      return currentUserRoleRank > optionRank; 
    });
  }, [currentUserRoleRank]);

  useEffect(() => {
    if (allowedRoleOptions.length === 0) {
      return;
    }

    const roleAllowed = allowedRoleOptions.some((option) => option.value === role);
    if (!roleAllowed) {
      setRole(allowedRoleOptions[0].value);
    }
  }, [allowedRoleOptions, role]);

  const canSubmit = useMemo(() => {
    const roleAllowed = allowedRoleOptions.some((option) => option.value === role);
    return Boolean(selectedMember?.email && roleAllowed && !loadingAction);
  }, [selectedMember, role, loadingAction, allowedRoleOptions]);

  const runRoleAction = async (actionType) => {
    if (!canSubmit) {
      if (!selectedMember?.email) {
        setError("Select a member before performing role actions.");
      } else {
        setError("You can only assign or revoke roles equal to or below your current role.");
      }
      return;
    }

    try {
      setLoadingAction(actionType);
      setError("");
      setSuccess("");

      const payloadEmail = selectedMember.email.trim().toLowerCase();
      const payloadRole = role.trim();

      const response =
        actionType === "grant"
          ? await endeavourApiClient.grantRole(payloadEmail, payloadRole)
          : await endeavourApiClient.revokeRole(payloadEmail, payloadRole);

      setSuccess(response?.message || `Role ${actionType}ed successfully.`);
      await fetchEligibleMembers(false);
    } catch (err) {
      setError(err?.message || `Failed to ${actionType} role.`);
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="min-h-screen p-6">
      {error && (
        <div className="fixed right-6 top-6 z-[80] w-full max-w-sm rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Role action failed</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-md p-1 text-red-700 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed right-6 top-6 z-[80] w-full max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Success</p>
                <p className="mt-1 text-sm">{success}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100"
              aria-label="Dismiss success"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Roles and Access</h1>
              <p className="mt-1 text-sm text-slate-600">Assign admin roles with hierarchy restrictions and monitor current access holders.</p>
            </div>

            <button
              type="button"
              onClick={() => fetchEligibleMembers(false)}
              disabled={membersRefreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${membersRefreshing ? "animate-spin" : ""}`} />
              Refresh Members
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Eligible</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{memberStats.total}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Verified</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{memberStats.verified}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Domains</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{memberStats.domains}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Has Access</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{membersWithPanelAccess.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your Role</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{currentUser?.role || "Unknown"}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.45fr,1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Eligible Candidates (All Members)</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{members.length}</span>
            </div>

            <div className="mt-3 relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={memberSearchTerm}
                onChange={(event) => setMemberSearchTerm(event.target.value)}
                placeholder="Search members by name, email, domain, year"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
              />
            </div>

            {membersLoading ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-600" />
                <p className="mt-2 text-sm text-slate-600">Loading members...</p>
              </div>
            ) : membersError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Unable to load members</p>
                    <p className="mt-1 text-sm">{membersError}</p>
                  </div>
                </div>
              </div>
            ) : visibleMembers.length === 0 ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                <Users className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-2 text-sm">No members found.</p>
              </div>
            ) : (
              <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {visibleMembers.map((member) => {
                  const isActive = selectedMemberEmail === member?.email;
                  return (
                    <button
                      key={member.id || member.email}
                      type="button"
                      onClick={() => {
                        setSelectedMemberEmail(member.email || "");
                        setSuccess("");
                        setError("");
                      }}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{member?.name || "Unnamed Member"}</p>
                        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          Year {member?.year || "-"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-600">{member?.email || "No email"}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">{member?.access_type || "No access"}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">{member?.account_type || "No account type"}</span>
                        {member?.domain ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">{member.domain}</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Role Assignment</h2>
            <p className="mt-1 text-xs text-slate-600">Step 1: Select member, Step 2: Choose permitted role, Step 3: Apply action.</p>

            {selectedMember ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2 text-slate-600 shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{selectedMember.name || "Unnamed Member"}</p>
                    <p className="truncate text-xs text-slate-600">{selectedMember.email || "No email"}</p>
                    <p className="mt-1 text-xs text-slate-500">Current access: {selectedMember.access_type || "No access"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Select a member first.</div>
            )}

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Permitted Roles</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {allowedRoleOptions.map((item) => {
                  const isSelected = role === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? "border-slate-800 bg-slate-800 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className={`h-4 w-4 ${isSelected ? "text-slate-100" : "text-slate-400"}`} />
                    </button>
                  );
                })}
                {allowedRoleOptions.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    You do not have permission to manage any roles.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-slate-500" />
                <p>Only predefined roles are available to avoid invalid backend values.</p>
              </div>
              <p className="mt-2">
                Target: <span className="font-semibold">{selectedMember?.email || "No member selected"}</span>
              </p>
              <p className="mt-1">
                Role: <span className="font-semibold">{role}</span>
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => runRoleAction("grant")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingAction === "grant" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4" />}
                Grant Role
              </button>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => runRoleAction("revoke")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingAction === "revoke" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4" />}
                Revoke Role
              </button>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">Members With Existing Access</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{membersWithPanelAccess.length}</span>
          </div>

          {accessRoleBreakdown.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {accessRoleBreakdown.map((item) => (
                <span key={item.roleName} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  {item.roleName}: {item.count}
                </span>
              ))}
            </div>
          ) : null}

          {membersWithPanelAccess.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No members currently have an elevated access role.</p>
          ) : (
            <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
              {membersWithPanelAccess.map((member) => (
                <div key={`access-${member.id || member.email}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{member.name || "Unnamed Member"}</p>
                      <p className="truncate text-xs text-slate-600">{member.email || "No email"}</p>
                    </div>
                    <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      Year {member.year || "-"}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      {member.access_type || "ACCESS"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
