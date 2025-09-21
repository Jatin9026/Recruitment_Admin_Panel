import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          {/* Attendance Status in Header */}
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              applicant.isPresent === true 
                ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' 
                : 'bg-amber-500/20 text-amber-100 border border-amber-400/30'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                applicant.isPresent === true 
                  ? 'bg-emerald-400' 
                  : 'bg-amber-400'
              }`}></span>
              {applicant.isPresent === true ? 'Present' : 'Not Marked'}
            </span>
          </div>
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
                      <p className="font-mono font-medium text-gray-900">{applicant.lib_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold">🎓</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Course & Branch</p>
                      <p className="font-medium text-gray-900">{applicant.course} - {applicant.branch}</p>
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

                  {applicant.assignedSlot && (
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Assigned Slot</p>
                      <p className="text-sm text-gray-700 font-medium">{applicant.assignedSlot}</p>
                    </div>
                  )}

                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Gender</p>
                    <p className="text-sm text-gray-700">{applicant.gender || "Not specified"}</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Hosteller</p>
                    <p className="text-sm text-gray-700">{applicant.isHosteller ? "Yes" : "No"}</p>
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

                {applicant.domain_pref_one && Object.keys(applicant.domain_pref_one).length > 0 && (
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                      <h4 className="font-semibold text-gray-800">First Preference</h4>
                    </div>
                    <div className="ml-8">
                      <p className="font-medium text-blue-700">{applicant.domain_pref_one.name}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{applicant.domain_pref_one.reason}</p>
                    </div>
                  </div>
                )}

                {applicant.domain_pref_two && Object.keys(applicant.domain_pref_two).length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
                      <h4 className="font-semibold text-gray-800">Second Preference</h4>
                    </div>
                    <div className="ml-8">
                      <p className="font-medium text-blue-700">{applicant.domain_pref_two.name}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{applicant.domain_pref_two.reason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Motivation */}
              {applicant.why_ecell && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Why E-Cell?
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">{applicant.why_ecell}</p>
                  </div>
                </div>
              )}

              {/* What Motivates You */}
              {applicant.what_motivates_you && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    What Motivates You?
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">{applicant.what_motivates_you}</p>
                  </div>
                </div>
              )}

              {/* Past Achievements */}
              {applicant.pastAchievement && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Past Achievements
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">{applicant.pastAchievement}</p>
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

export default ApplicantDetailModal;