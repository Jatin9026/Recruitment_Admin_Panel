import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { create } from "zustand";
import { apiClient } from "../../utils/apiConfig";
import { RefreshCw } from "lucide-react";


function ApplicantRow({ applicant, onView, onSelect, isSelected, disableCheckbox }) {
  const handleViewClick = () => {
    onView(applicant);
  };
  const handleSelectClick = () => {
    onSelect(applicant.id);
  };

  return (
    <tr className={`border-b transition-all duration-200 ${
      isSelected 
        ? 'bg-blue-50 border-blue-200' 
        : 'hover:bg-gray-50 border-gray-200'
    }`}>
      <td className="px-4 py-4 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectClick}
          disabled={disableCheckbox}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 transition-all"
        />
      </td>
      <td className="px-4 py-4">
        <div className="font-medium text-gray-900">{applicant.name}</div>
      </td>
      <td className="px-4 py-4">
        <div className="text-gray-600 text-sm break-words">{applicant.email}</div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {applicant.department}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="text-gray-900 font-mono text-sm">{applicant.libraryId}</div>
      </td>
      <td className="px-4 py-4">
        {applicant.groupNumber ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Group {applicant.groupNumber}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Unassigned
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-right">
        <button
          onClick={handleViewClick}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
      </td>
    </tr>
  );
}


const useApplicantStore = create((set, get) => ({
  applicants: [],
  selectedApplicant: null,
  selectedIds: [],
  slotDate: "",
  slotHour: "",
  endTime: "",
  roundDuration: "",
  batchSize: "",
  selectLimit: "",
  message: "",
  messageType: "",
  loading: false,

  setMessage: (msg, type = 'info') => set({ message: msg, messageType: type }),

  setSelectedApplicant: (applicant) => set({ selectedApplicant: applicant }),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    })),

  selectUnassigned: (limit) =>
    set((state) => {
      const unassignedApplicants = state.applicants
        .filter((a) => !a.groupNumber || a.groupNumber === null || a.groupNumber === undefined);
      
      // Shuffle the array for random selection
      const shuffled = [...unassignedApplicants].sort(() => 0.5 - Math.random());
      
      // Apply limit if provided, otherwise select all
      const limitedSelection = limit && limit > 0 
        ? shuffled.slice(0, Math.min(limit, shuffled.length))
        : shuffled;
      
      return {
        selectedIds: limitedSelection.map((a) => a.id),
      };
    }),

  clearSelection: () => set({ selectedIds: [] }),

  assignSlot: async () => {
    const {
      slotDate,
      slotHour,
      endTime,
      roundDuration,
      batchSize,
      selectedIds,
      applicants,
      setMessage
    } = get();

    if (!slotDate || !slotHour || !endTime || !roundDuration || !batchSize) {
      setMessage("Please fill all slot fields (date, start, end, duration, batch size)", 'error');
      return;
    }

    // Filter selected applicants to only include those without group numbers
    const selectedApplicants = applicants.filter((a) => 
      selectedIds.includes(a.id) && (!a.groupNumber || a.groupNumber === null || a.groupNumber === undefined)
    );

    if (selectedApplicants.length === 0) {
      setMessage("No unassigned applicants selected. Only applicants without group numbers can be assigned slots.", 'error');
      return;
    }

    // Check if some selected applicants already have groups
    const selectedWithGroups = applicants.filter((a) => 
      selectedIds.includes(a.id) && (a.group && a.group !== null && a.group !== undefined)
    );

    if (selectedWithGroups.length > 0) {
      setMessage(`${selectedWithGroups.length} selected applicants already have groups and will be skipped. Proceeding with ${selectedApplicants.length} unassigned applicants.`, 'info');
    }

    const emails = selectedApplicants.map((a) => a.email);

    const payload = {
      emails,
      batchSize: Number(batchSize),
      startDate: slotDate,
      startTime: slotHour,
      endTime,
      roundDuration: Number(roundDuration),
    };

    try {
      const result = await apiClient.bulkCreateRounds(payload);

      // Update local state based on API response
      const updatedApplicants = applicants.map((app) => {
        const wasAssigned = selectedApplicants.find((sa) => sa.id === app.id);
        if (wasAssigned) {
          return {
            ...app,
            slot: { startAt: `${slotDate}T${slotHour}:00` },
            status: "scheduled", // Update status as per API response
            group: result.batches?.find(batch => 
              batch.users.includes(app.email)
            )?.groupNumber || app.groupNumber,
          };
        }
        return app;
      });
      

      set({
        applicants: updatedApplicants,
        selectedIds: [],
        slotDate: "",
        slotHour: "",
        endTime: "",
        roundDuration: "",
        batchSize: "",
      });

      setMessage(`Slots assigned successfully! ${result.totalUsersScheduled || selectedApplicants.length} applicants scheduled in ${result.totalBatches || 1} batches.`, 'success');
    } catch (err) {
      console.error("Failed to assign slot:", err);
      setMessage("Failed to assign slot. Check console.", 'error');
    }
  },

  fetchApplicants: async () => {
    const { setMessage } = get();
    set({ loading: true });
    try {
      const data = await apiClient.getUsers();

      const mapped = data.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        year: u.year,
        libraryId: u.lib_id,
        linkedIn: u.linkedIn || "",
        department: u.branch,
        whyEcell: u.why_ecell || "",
        domainPrefOne: u.domain_pref_one || {},
        domainPrefTwo: u.domain_pref_two || {},
        domains: u.domains || [],
        groupNumber: u.groupNumber || null,
        status: u.status || "Pending",
        appliedAt: u.createdAt || new Date().toISOString(),
        slot: u.slot || null,
        shortlisted: u.shortlisted || false,
        // Round status objects
        screening: u.screening || {},
        gd: u.gd || {},
        pi: u.pi || {},
        task: u.task || {},
      }));

      // Sort applicants: unassigned first, then by group number ascending
      const sorted = mapped.sort((a, b) => {
        // If one has groupNumber and other doesn't, unassigned comes first
        const aHasGroup = a.groupNumber !== null && a.groupNumber !== undefined;
        const bHasGroup = b.groupNumber !== null && b.groupNumber !== undefined;
        
        if (!aHasGroup && bHasGroup) return -1; // a (unassigned) comes first
        if (aHasGroup && !bHasGroup) return 1;  // b (unassigned) comes first
        
        // If both have groups, sort by group number ascending
        if (aHasGroup && bHasGroup) {
          return a.groupNumber - b.groupNumber;
        }
        
        // If both are unassigned, maintain original order
        return 0;
      });

      set({ applicants: sorted, loading: false });
      setMessage(`Loaded ${sorted.length} applicants`, 'success');
    } catch (err) {
      console.error("Failed to fetch applicants. This is likely a network or CORS issue.", err);
      setMessage("Failed to load applicants. The server is not responding, please check your network connection or try again later.", 'error');
      set({ loading: false });
    }
  },

  setSlotDate: (date) => set({ slotDate: date }),
  setSlotHour: (hour) => set({ slotHour: hour }),
  setEndTime: (end) => set({ endTime: end }),
  setRoundDuration: (dur) => set({ roundDuration: dur }),
  setBatchSize: (size) => set({ batchSize: size }),
  setSelectLimit: (limit) => set({ selectLimit: limit }),
}));

// A simple message box component
function MessageBox({ message, type, onClose }) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;
  
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className={`fixed top-4 right-4 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-transform transform translate-x-0 ${bgColor}`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-lg font-bold">
          &times;
        </button>
      </div>
    </div>
  );
}


const useUIStore = create(() => ({
  theme: "light",
}));


function ApplicantDetailModal({ applicant, onClose }) {
  if (!applicant) return null;

  // Helper function to format datetime
  const formatDateTime = (datetime) => {
    if (!datetime) return "Not scheduled";
    return new Date(datetime).toLocaleString();
  };

  // Helper function to get status color and icon
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: '✅',
          textColor: 'text-green-600'
        };
      case 'scheduled': 
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: '📅',
          textColor: 'text-blue-600'
        };
      case 'pending': 
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: '⏳',
          textColor: 'text-yellow-600'
        };
      case 'cancelled': 
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: '❌',
          textColor: 'text-red-600'
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-600 border-gray-200', 
          icon: '⚪',
          textColor: 'text-gray-500'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{applicant.name}</h2>
              <p className="text-blue-100 text-sm">{applicant.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {applicant.groupNumber && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Group {applicant.groupNumber}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Personal Information Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold">📞</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="font-medium text-gray-900">{applicant.phone || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-semibold">🆔</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Library ID</p>
                      <p className="font-mono font-medium text-gray-900">{applicant.libraryId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold">🎓</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Department & Year</p>
                      <p className="font-medium text-gray-900">{applicant.department}</p>
                      <p className="text-sm text-gray-600">Year {applicant.year}</p>
                    </div>
                  </div>

                  {applicant.linkedIn && (
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold">💼</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">LinkedIn</p>
                        <a 
                          href={applicant.linkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium truncate block"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Application Date</p>
                    <p className="text-sm text-gray-700">{new Date(applicant.appliedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Domain Preferences & Motivation */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Domain Preferences */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Domain Preferences
                </h3>
                
                {applicant.domains && applicant.domains.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Domains:</p>
                    <div className="flex flex-wrap gap-2">
                      {applicant.domains.map((domain, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {applicant.domainPrefOne && Object.keys(applicant.domainPrefOne).length > 0 && (
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                      <h4 className="font-semibold text-gray-800">First Preference</h4>
                    </div>
                    <div className="ml-8">
                      <p className="font-medium text-blue-700">{applicant.domainPrefOne.name}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{applicant.domainPrefOne.reason}</p>
                    </div>
                  </div>
                )}

                {applicant.domainPrefTwo && Object.keys(applicant.domainPrefTwo).length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
                      <h4 className="font-semibold text-gray-800">Second Preference</h4>
                    </div>
                    <div className="ml-8">
                      <p className="font-medium text-blue-700">{applicant.domainPrefTwo.name}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{applicant.domainPrefTwo.reason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Motivation */}
              {applicant.whyEcell && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Why E-Cell?
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">{applicant.whyEcell}</p>
                  </div>
                </div>
              )}

              {/* Recruitment Progress */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recruitment Progress
                </h3>
                
                <div className="space-y-4">
                  {/* Group Discussion */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-lg mr-2">💬</span>
                        Group Discussion
                      </h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusInfo(applicant.gd?.status).color}`}>
                        <span className="mr-1">{getStatusInfo(applicant.gd?.status).icon}</span>
                        {applicant.gd?.status || "Not scheduled"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Date & Time</p>
                        <p className="font-medium text-gray-900">{formatDateTime(applicant.gd?.datetime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Remarks</p>
                        <p className="font-medium text-gray-900">{applicant.gd?.remarks || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Screening */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-lg mr-2">📋</span>
                        Screening
                      </h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusInfo(applicant.screening?.status).color}`}>
                        <span className="mr-1">{getStatusInfo(applicant.screening?.status).icon}</span>
                        {applicant.screening?.status || "Not scheduled"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Date & Time</p>
                        <p className="font-medium text-gray-900">{formatDateTime(applicant.screening?.datetime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Remarks</p>
                        <p className="font-medium text-gray-900">{applicant.screening?.remarks || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Interview */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-lg mr-2">🎯</span>
                        Personal Interview
                      </h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusInfo(applicant.pi?.status).color}`}>
                        <span className="mr-1">{getStatusInfo(applicant.pi?.status).icon}</span>
                        {applicant.pi?.status || "Not scheduled"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Date & Time</p>
                        <p className="font-medium text-gray-900">{formatDateTime(applicant.pi?.datetime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Remarks</p>
                        <p className="font-medium text-gray-900">
                          {Array.isArray(applicant.pi?.remarks) 
                            ? applicant.pi.remarks.join(", ") 
                            : applicant.pi?.remarks || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Task */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-lg mr-2">📝</span>
                        Task Assignment
                      </h4>
                      {applicant.task && Object.keys(applicant.task).length > 0 ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusInfo(applicant.task?.status).color}`}>
                          <span className="mr-1">{getStatusInfo(applicant.task?.status).icon}</span>
                          {applicant.task?.status || "Assigned"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
                          <span className="mr-1">⚪</span>
                          No task assigned
                        </span>
                      )}
                    </div>
                    {applicant.task && Object.keys(applicant.task).length > 0 && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Date & Time</p>
                          <p className="font-medium text-gray-900">{formatDateTime(applicant.task?.datetime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Remarks</p>
                          <p className="font-medium text-gray-900">{applicant.task?.remarks || "—"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function ApplicantList() {
  const { theme } = useUIStore();
  const location = useLocation();
  const {
    applicants,
    selectedApplicant,
    selectedIds,
    slotDate,
    slotHour,
    endTime,
    roundDuration,
    batchSize,
    selectLimit,
    message,
    messageType,
    loading,
    setSelectedApplicant,
    toggleSelect,
    selectUnassigned,
    clearSelection,
    assignSlot,
    setSlotDate,
    setSlotHour,
    setEndTime,
    setRoundDuration,
    setBatchSize,
    setSelectLimit,
    fetchApplicants,
    setMessage,
  } = useApplicantStore();
  
  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);
  
  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  useEffect(() => {
    // Ensure scroll to top after data is loaded
    if (!loading) {
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  }, [loading]);

  const totalApplicants = applicants.length;

  const totalAssignedGroups = applicants.filter(app => app.groupNumber !== null && app.groupNumber !== undefined).length;
  const totalUnassigned = applicants.filter(app => !app.groupNumber || app.groupNumber === null || app.groupNumber === undefined).length;

  function handleAssignSlot() {
    if (selectedIds.length === 0) {
      setMessage("Please select at least one applicant.", "error");
      return;
    }
    assignSlot();
  }

  function handleSelectUnassigned() {
    const limit = parseInt(selectLimit) || 0;
    const unassignedCount = totalUnassigned;
    
    if (limit > 0 && limit < unassignedCount) {
      selectUnassigned(limit);
      setMessage(`Randomly selected ${limit} unassigned applicants out of ${unassignedCount}.`, "info");
    } else if (limit > 0 && limit >= unassignedCount) {
      selectUnassigned();
      setMessage(`Selected all ${unassignedCount} unassigned applicants (limit was higher than total).`, "info");
    } else {
      selectUnassigned();
      setMessage(`Selected all ${unassignedCount} unassigned applicants.`, "info");
    }
  }

  function handleClearSelection() {
    clearSelection();
    setMessage("Selection cleared.", "info");
  }

  function handleRefresh() {
    setMessage("Refreshing applicants data...", "info");
    fetchApplicants();
  }

  return (
    <div
      className={`p-3 sm:p-4 md:p-4 min-h-screen transition-colors ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <MessageBox 
        message={message} 
        type={messageType} 
        onClose={() => setMessage("", "")} 
      />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Applicants Management
          </h1>
          <p className="text-gray-600 text-sm">Manage and assign slots to applicants</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{totalApplicants}</div>
          <div className="text-sm text-blue-600 font-medium">Total Students</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{totalAssignedGroups}</div>
          <div className="text-sm text-green-600 font-medium">Groups Assigned</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-700">{totalUnassigned}</div>
          <div className="text-sm text-orange-600 font-medium">Unassigned</div>
        </div>
      </div>

      {/* Slot Assignment Form */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">Slot Assignment Configuration</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={slotHour}
                onChange={(e) => setSlotHour(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                value={roundDuration}
                onChange={(e) => setRoundDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter duration"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Batch Size</label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Students per batch"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Selection Limit</label>
              <input
                type="number"
                placeholder="Optional"
                value={selectLimit}
                onChange={(e) => setSelectLimit(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleAssignSlot}
              disabled={selectedIds.length === 0}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${
                selectedIds.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Assign Slot ({selectedIds.length} selected)
              </span>
            </button>
            <button
              onClick={handleSelectUnassigned}
              disabled={totalUnassigned === 0}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${
                totalUnassigned === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Select Unassigned ({totalUnassigned})
                {selectLimit && parseInt(selectLimit) > 0 && ` - Limit: ${selectLimit}`}
              </span>
            </button>
            <button
              onClick={handleClearSelection}
              className="flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold text-sm transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Selection
              </span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Applicants List</h3>
            <p className="text-sm text-gray-600 mt-1">
              {applicants.length} total applicants • {selectedIds.length} selected
            </p>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 shadow-sm border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Library ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Group Status
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                      <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="font-medium">Loading applicants...</span>
                    </div>
                  </td>
                </tr>
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">No applicants found</p>
                        <p className="text-sm mt-1">There are no applicants to display at the moment.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                applicants.map((app) => (
                  <ApplicantRow
                    key={app._id || app.id}
                    applicant={app}
                    onView={setSelectedApplicant}
                    onSelect={toggleSelect}
                    isSelected={selectedIds.includes(app._id || app.id)}
                    disableCheckbox={!!app.groupNumber}
                  />
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Applicants</h3>
            <p className="text-sm text-gray-600 mt-1">
              {applicants.length} total • {selectedIds.length} selected
            </p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Loading applicants...</span>
              </div>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No applicants found</p>
            </div>
          ) : (
            applicants.map((app) => (
              <div key={app.id || app._id} className={`border rounded-lg shadow-sm transition-all duration-200 ${
                selectedIds.includes(app._id || app.id) 
                  ? 'border-blue-300 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:shadow-md'
              }`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app._id || app.id)}
                        onChange={() => toggleSelect(app._id || app.id)}
                        disabled={!!app.groupNumber}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 transition-all"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{app.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedApplicant(app)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Department</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {app.department}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Library ID</span>
                      <span className="text-sm font-mono text-gray-900">{app.libraryId}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-500">Group Status</span>
                      {app.groupNumber ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Group {app.groupNumber}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
            </div>
          </div>
        </div>
      </div>

      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </div>
  );
}
