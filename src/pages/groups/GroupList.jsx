import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../utils/apiConfig";
import useApplicantStore from "../../store/applicantStore";
import toast, { Toaster } from "react-hot-toast";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  RotateCcw,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar
} from "lucide-react";

export default function GroupManager() {
  const { applicants, fetchApplicants } = useApplicantStore();
  const location = useLocation();
  const [groupedApplicants, setGroupedApplicants] = useState({});
  const [rejectedApplicants, setRejectedApplicants] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [showStats, setShowStats] = useState(true);
  const [processingGroup, setProcessingGroup] = useState(null);

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    loadApplicants();
  }, []);

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

  useEffect(() => {
    organizeByGroups();
  }, [applicants, searchQuery, filterStatus, filterGroup]);

  // Debug function to check for duplicate emails
  useEffect(() => {
    if (applicants.length > 0) {
      const emails = applicants.map(a => a.email);
      const uniqueEmails = new Set(emails);
      if (emails.length !== uniqueEmails.size) {
        console.warn('Duplicate emails found in applicants:', emails.filter((email, index) => emails.indexOf(email) !== index));
      }
      console.log('Total applicants:', applicants.length, 'Unique emails:', uniqueEmails.size);
      
      // Debug: Check first applicant structure
      if (applicants[0]) {
        console.log('Sample applicant structure:', {
          email: applicants[0].email,
          name: applicants[0].name,
          hasGD: !!applicants[0].gd,
          gdStatus: applicants[0].gd?.status,
          status: applicants[0].status,
          groupNumber: applicants[0].groupNumber
        });
      }
    }
  }, [applicants]);



  const loadApplicants = async () => {
    try {
      setLoading(true);
      await fetchApplicants();
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const organizeByGroups = () => {
    let filtered = applicants.filter(applicant => {
      const matchesSearch = !searchQuery || 
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.libraryId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || applicant.status === filterStatus;
      
      const matchesGroup = filterGroup === "all" || 
        (filterGroup === "unassigned" && !applicant.groupNumber) ||
        (filterGroup === "assigned" && applicant.groupNumber) ||
        (applicant.groupNumber && applicant.groupNumber.toString() === filterGroup);
      
      return matchesSearch && matchesStatus && matchesGroup;
    });

    const grouped = filtered.reduce((acc, applicant) => {
      const groupKey = applicant.groupNumber || 'unassigned';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(applicant);
      return acc;
    }, {});

    // Sort groups: numbered groups first, then unassigned
    const sortedGrouped = {};
    const groupKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'unassigned') return 1;
      if (b === 'unassigned') return -1;
      return parseInt(a) - parseInt(b);
    });

    groupKeys.forEach(key => {
      sortedGrouped[key] = grouped[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    setGroupedApplicants(sortedGrouped);
  };

  const toggleGroupExpansion = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleApplicantRejection = (applicantEmail) => {
    console.log('Toggling rejection for applicant email:', applicantEmail);
    console.log('Current rejected applicants:', Array.from(rejectedApplicants));
    
    const newRejected = new Set(rejectedApplicants);
    const applicant = applicants.find(a => a.email === applicantEmail);
    
    if (!applicant) {
      console.error('Applicant not found:', applicantEmail);
      toast.error('Applicant not found');
      return;
    }
    
    if (newRejected.has(applicantEmail)) {
      newRejected.delete(applicantEmail);
      toast.success(`${applicant.name} restored to selection pool`);
      console.log('Restored applicant:', applicant.name);
    } else {
      newRejected.add(applicantEmail);
      toast.error(`${applicant.name} marked for rejection`);
      console.log('Marked for rejection:', applicant.name);
    }
    
    console.log('New rejected applicants:', Array.from(newRejected));
    setRejectedApplicants(newRejected);
  };

  const rejectAllInGroup = (groupApplicants) => {
    const newRejected = new Set(rejectedApplicants);
    groupApplicants.forEach(applicant => {
      newRejected.add(applicant.email);
    });
    setRejectedApplicants(newRejected);
    toast.error(`Rejected ${groupApplicants.length} applicants`);
  };

  // Check if all applicants in a group have been processed (selected, rejected)
  const isGroupComplete = (groupApplicants) => {
    return groupApplicants.every(applicant => {
      // Check local states first
      const isLocallyRejected = rejectedApplicants.has(applicant.email);
      
      // Check if applicant has been processed via API (gd.status exists)
      // scheduled means GD is scheduled, NOT that they were selected
      const hasGDStatus = applicant.gd && (
        applicant.gd.status === 'selected' || 
        applicant.gd.status === 'rejected'
      );
      
      // Applicant is complete if locally marked for rejection or has GD status
      return isLocallyRejected || hasGDStatus;
    });
  };

  // Get group completion status
  const getGroupStatus = (groupApplicants) => {
    const totalApplicants = groupApplicants.length;
    const locallyRejected = groupApplicants.filter(a => rejectedApplicants.has(a.email)).length;
    const processedViaAPI = groupApplicants.filter(a => 
      a.gd && (a.gd.status === 'selected' || a.gd.status === 'rejected')
    ).length;
    
    // Calculate unique processed applicants (avoid double counting)
    const processedApplicants = groupApplicants.filter(a => 
      rejectedApplicants.has(a.email) || 
      (a.gd && (a.gd.status === 'selected' || a.gd.status === 'rejected'))
    ).length;
    
    if (processedApplicants === totalApplicants && totalApplicants > 0) {
      return 'complete';
    } else if (processedApplicants > 0) {
      return 'in-progress';
    } else {
      return 'pending';
    }
  };

  const updateGroupStatus = async (groupKey, groupApplicants) => {
    const groupRejected = groupApplicants.filter(a => rejectedApplicants.has(a.email));
    const groupSelected = groupApplicants.filter(a => 
      !rejectedApplicants.has(a.email)
    );

    if (groupRejected.length === 0 && groupSelected.length === 0) {
      toast.error("No applicants in this group");
      return;
    }

    try {
      setProcessingGroup(groupKey);
      
      // Update rejected applicants in this group
      if (groupRejected.length > 0) {
        const rejectedEmails = groupRejected.map(a => a.email);
        
        const rejectPayload = {
          emails: rejectedEmails,
          gd: {
            status: "rejected",
            datetime: new Date().toISOString(),
            remarks: `Rejected from Group ${groupKey === 'unassigned' ? 'Unassigned' : groupKey}`
          },
          screening: {
            status: "rejected",
            datetime: new Date().toISOString(),
            remarks: `Rejected from Group ${groupKey === 'unassigned' ? 'Unassigned' : groupKey}`
          },
          pi: {
            status: "rejected",
            datetime: new Date().toISOString(),
            remarks: `Rejected from Group ${groupKey === 'unassigned' ? 'Unassigned' : groupKey}`
          }
        };
        
        await apiClient.bulkUpdateRounds(rejectPayload);
        toast.success(`${rejectedEmails.length} applicants marked as rejected in Group ${groupKey === 'unassigned' ? 'Unassigned' : groupKey}`);
      }

      // Update remaining (selected) applicants in this group
      if (groupSelected.length > 0) {
        const selectedEmails = groupSelected.map(a => a.email);
        
        const approvePayload = {
          emails: selectedEmails,
          gd: {
            status: "selected",
            datetime: new Date().toISOString(),
            remarks: `Selected from Group ${groupKey === 'unassigned' ? 'Unassigned' : groupKey}`
          }
        };
        
        await apiClient.bulkUpdateRounds(approvePayload);
        toast.success(`${selectedEmails.length} applicants marked as selected in Group ${groupKey === 'unassigned' ? 'Unassigned' : groupKey}`);
      }

      // Clear selections for this group and reload data
      const groupApplicantEmails = groupApplicants.map(a => a.email);
      setRejectedApplicants(prev => {
        const newSet = new Set(prev);
        groupApplicantEmails.forEach(email => newSet.delete(email));
        return newSet;
      });
      
      await loadApplicants();
      
    } catch (error) {
      console.error("Error updating group status:", error);
      toast.error(`Failed to update Group ${groupKey === 'unassigned' ? 'Unassigned' : groupKey} status`);
    } finally {
      setProcessingGroup(null);
    }
  };

  const clearAllSelections = () => {
    setRejectedApplicants(new Set());
    toast.info("All selections cleared");
  };

  // Helper function to get group schedule info
  const getGroupScheduleInfo = (groupApplicants) => {
    // Find any applicant in the group that has gd.datetime
    const applicantWithSchedule = groupApplicants.find(a => a.gd && a.gd.datetime);
    
    if (applicantWithSchedule && applicantWithSchedule.gd.datetime) {
      const dateTime = new Date(applicantWithSchedule.gd.datetime);
      return {
        hasSchedule: true,
        date: dateTime.toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: dateTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        fullDateTime: dateTime
      };
    }
    
    return { hasSchedule: false };
  };

  const getStats = () => {
    const total = applicants.length;
    const grouped = applicants.filter(a => a.groupNumber).length;
    const unassigned = applicants.filter(a => !a.groupNumber).length;
    const rejected = rejectedApplicants.size;
    const groups = new Set(applicants.filter(a => a.groupNumber).map(a => a.groupNumber)).size;
    
    // Group completion statistics
    const groupStatuses = Object.entries(groupedApplicants).map(([groupKey, groupApplicants]) => ({
      groupKey,
      status: getGroupStatus(groupApplicants),
      count: groupApplicants.length
    }));
    
    const completeGroups = groupStatuses.filter(g => g.status === 'complete').length;
    const inProgressGroups = groupStatuses.filter(g => g.status === 'in-progress').length;
    const pendingGroups = groupStatuses.filter(g => g.status === 'pending').length;
    const totalGroups = groupStatuses.length;
    
    return { 
      total, 
      grouped, 
      unassigned, 
      rejected, 
      groups,
      completeGroups,
      inProgressGroups,
      pendingGroups,
      totalGroups,
      completionRate: totalGroups > 0 ? Math.round((completeGroups / totalGroups) * 100) : 0
    };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'selected':
      case 'shortlisted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">Loading groups...</span>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4 bg-gray-50 min-h-screen">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
              <p className="text-gray-600">Manage applicants by groups with selection and rejection features</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadApplicants}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStats(!showStats)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{showStats ? 'Hide' : 'Show'} Stats</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { label: "Total", value: stats.total, icon: User, color: "blue" },
              { label: "Groups", value: stats.groups, icon: Users, color: "purple" },
              { label: "Complete Groups", value: stats.completeGroups, icon: CheckCircle, color: "green" },
              { label: "In Progress", value: stats.inProgressGroups, icon: Clock, color: "yellow" },
              { label: "Pending Groups", value: stats.pendingGroups, icon: XCircle, color: "gray" },
              { label: "Marked for Rejection", value: stats.rejected, icon: UserX, color: "red" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.label === "Complete Groups" && stats.totalGroups > 0 && (
                      <p className="text-sm text-green-600 font-medium">{stats.completionRate}% Complete</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or library ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Groups</option>
              <option value="assigned">Has Group</option>
              <option value="unassigned">No Group</option>
              {Object.keys(groupedApplicants)
                .filter(key => key !== 'unassigned')
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(groupNum => (
                <option key={groupNum} value={groupNum}>Group {groupNum}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Groups Display */}
      <div className="space-y-4">
        {Object.keys(groupedApplicants).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Found</h3>
            <p className="text-gray-600">No applicants match your current filters.</p>
          </motion.div>
        ) : (
          Object.entries(groupedApplicants).map(([groupKey, groupApplicants], index) => (
            <motion.div
              key={groupKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Group Header */}
              <div
                onClick={() => toggleGroupExpansion(groupKey)}
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      groupKey === 'unassigned' 
                        ? 'bg-orange-100 text-orange-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {groupKey === 'unassigned' ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <span className="font-bold text-lg">{groupKey}</span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {groupKey === 'unassigned' ? 'Unassigned Applicants' : `Group ${groupKey}`}
                        </h3>
                        {(() => {
                          const status = getGroupStatus(groupApplicants);
                          if (status === 'complete') {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </span>
                            );
                          } else if (status === 'in-progress') {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                In Progress
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            );
                          }
                        })()}
                      </div>
                      {(() => {
                        const scheduleInfo = getGroupScheduleInfo(groupApplicants);
                        if (scheduleInfo.hasSchedule && groupKey !== 'unassigned') {
                          return (
                            <div className="flex items-center space-x-2 mt-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-700">
                                Scheduled: {scheduleInfo.date} at {scheduleInfo.time}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{groupApplicants.length} applicants</span>
                        <span>•</span>
                        <span>{groupApplicants.filter(a => 
                          !rejectedApplicants.has(a.email) &&
                          !(a.gd && (a.gd.status === 'rejected' || a.gd.status === 'selected'))
                        ).length} for selection</span>
                        <span>•</span>
                        <span>{groupApplicants.filter(a => 
                          a.gd && a.gd.status === 'selected'
                        ).length} selected</span>
                        <span>•</span>
                        <span>{groupApplicants.filter(a => 
                          rejectedApplicants.has(a.email) || 
                          (a.gd && a.gd.status === 'rejected')
                        ).length} rejected</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectAllInGroup(groupApplicants);
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Reject All
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateGroupStatus(groupKey, groupApplicants);
                      }}
                      disabled={processingGroup === groupKey || getGroupStatus(groupApplicants) === 'complete'}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
                        getGroupStatus(groupApplicants) !== 'complete'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={getGroupStatus(groupApplicants) === 'complete' ? 'This group has already been finalized' : 'Submit final selections for this group'}
                    >
                      {processingGroup === groupKey ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Updating...</span>
                        </>
                      ) : getGroupStatus(groupApplicants) !== 'complete' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Final Update</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </>
                      )}
                    </button>
                    
                    {expandedGroups.has(groupKey) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Group Content */}
              <AnimatePresence>
                {expandedGroups.has(groupKey) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 bg-gray-50"
                  >
                    <div className="p-6 space-y-6">
                      {/* Regular Applicants Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                          <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                          Candidates for Selection ({groupApplicants.filter(a => 
                            !rejectedApplicants.has(a.email) &&
                            !(a.gd && (a.gd.status === 'rejected' || a.gd.status === 'selected'))
                          ).length})
                        </h4>
                        <div className="space-y-4">
                          {groupApplicants
                            .filter(a => 
                              !rejectedApplicants.has(a.email) &&
                              !(a.gd && (a.gd.status === 'rejected' || a.gd.status === 'selected'))
                            )
                            .map((applicant, applicantIndex) => (
                            <motion.div
                              key={`selection-${applicant.email}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: applicantIndex * 0.05 }}
                              className="relative bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-md transition-all duration-200"
                            >
                              {/* Selected indicator - only show for actually selected applicants */}
                              {applicant.gd && applicant.gd.status === 'selected' && (
                                <div className="absolute top-2 right-2">
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    SELECTED
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-start justify-between">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-20">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <User className="w-4 h-4 text-green-600" />
                                      <span className="font-semibold text-gray-900">{applicant.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-4 h-4 text-green-500" />
                                      <span className="text-sm text-gray-700">{applicant.email}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <GraduationCap className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm text-gray-700 font-medium">{applicant.department}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Award className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm text-gray-700">Year {applicant.year}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm text-gray-600">{applicant.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm text-gray-600">{applicant.libraryId}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs text-gray-600 font-medium">GD Status</span>
                                      {applicant.gd && applicant.gd.status ? (
                                        <span className="text-sm text-gray-700 font-medium">
                                          {applicant.gd.status}
                                        </span>
                                      ) : (
                                        <span className="text-sm text-gray-500">
                                          pending
                                        </span>
                                      )}
                                      {applicant.shortlisted && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                          ⭐ Shortlisted
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="absolute bottom-4 right-4">
                                  {applicant.gd && (applicant.gd.status === 'selected' || applicant.gd.status === 'rejected') ? (
                                    <div className="p-2 rounded-lg bg-gray-100 text-gray-400 shadow-sm border border-gray-300 cursor-not-allowed" title="Status already finalized via API">
                                      <UserX className="w-4 h-4" />
                                    </div>
                                  ) : (
                                    <div className="flex space-x-2">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                          console.log('Reject button clicked for:', applicant.name, 'Email:', applicant.email);
                                          toggleApplicantRejection(applicant.email);
                                        }}
                                        className="p-2 rounded-lg transition-colors bg-red-100 text-red-600 hover:bg-red-200 shadow-sm border border-red-300"
                                        title="Move to Rejected"
                                      >
                                        <UserX className="w-4 h-4" />
                                      </motion.button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          
                          {groupApplicants.filter(a => 
                            !rejectedApplicants.has(a.email) &&
                            !(a.gd && (a.gd.status === 'rejected' || a.gd.status === 'selected'))
                          ).length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p>No candidates remaining for selection</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Processed Applicants Section (Selected) */}
                      {groupApplicants.filter(a => 
                        a.gd && a.gd.status === 'selected'
                      ).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-4 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Selected Candidates ({groupApplicants.filter(a => 
                              a.gd && a.gd.status === 'selected'
                            ).length})
                          </h4>
                          <div className="space-y-4">
                            {groupApplicants
                              .filter(a => a.gd && a.gd.status === 'selected')
                              .map((applicant, applicantIndex) => (
                              <motion.div
                                key={`processed-${applicant.email}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: applicantIndex * 0.05 }}
                                className="relative bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-l-4 border-green-500 opacity-75"
                              >
                                <div className="absolute top-2 right-2">
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    SELECTED
                                  </div>
                                </div>
                                
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-20">
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-green-600" />
                                        <span className="font-semibold text-gray-900">{applicant.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-gray-700">{applicant.email}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <GraduationCap className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-gray-700 font-medium">{applicant.department}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Award className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-gray-700">Year {applicant.year}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{applicant.phone}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{applicant.libraryId}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-gray-600 font-medium">GD Status</span>
                                        <span className="text-sm text-green-700 font-medium">
                                          {applicant.gd.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejected Applicants Section */}
                      {groupApplicants.filter(a => 
                        rejectedApplicants.has(a.email) || 
                        (a.gd && a.gd.status === 'rejected')
                      ).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 mb-4 flex items-center">
                            <UserX className="w-4 h-4 mr-2 text-red-600" />
                            Rejected Candidates ({groupApplicants.filter(a => 
                              rejectedApplicants.has(a.email) || 
                              (a.gd && a.gd.status === 'rejected')
                            ).length})
                          </h4>
                          <div className="space-y-4">
                            {groupApplicants
                              .filter(a => 
                                rejectedApplicants.has(a.email) || 
                                (a.gd && a.gd.status === 'rejected')
                              )
                              .map((applicant, applicantIndex) => (
                              <motion.div
                                key={`rejected-${applicant.email}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: applicantIndex * 0.05 }}
                                className="relative bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border-l-4 border-red-500 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                {/* Rejected overlay effect */}
                                <div className="absolute top-2 right-2">
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    REJECTED
                                  </div>
                                </div>
                                
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-20">
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-red-500" />
                                        <span className="font-semibold text-red-900 line-through decoration-2">{applicant.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-red-700">{applicant.email}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2 opacity-75">
                                      <div className="flex items-center space-x-2">
                                        <GraduationCap className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-red-700">{applicant.department}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Award className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-red-700">Year {applicant.year}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2 opacity-75">
                                      <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-red-700">{applicant.phone}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-red-700">{applicant.libraryId}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-gray-600 font-medium">GD Status</span>
                                        {applicant.gd && applicant.gd.status === 'rejected' ? (
                                          <span className="text-sm text-red-700 font-medium">
                                            rejected
                                          </span>
                                        ) : (
                                          <span className="text-sm text-red-600 font-medium">
                                            marked for rejection
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="absolute bottom-4 right-4">
                                    {applicant.gd && applicant.gd.status === 'rejected' ? (
                                      <div className="p-2 rounded-lg bg-gray-100 text-gray-400 shadow-sm border border-gray-300 cursor-not-allowed" title="Final rejection status cannot be changed">
                                        <RotateCcw className="w-4 h-4" />
                                      </div>
                                    ) : (
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                          console.log('Restore button clicked for:', applicant.name, 'Email:', applicant.email);
                                          toggleApplicantRejection(applicant.email);
                                        }}
                                        className="p-2 rounded-lg transition-colors bg-green-100 text-green-700 hover:bg-green-200 shadow-sm border border-green-300"
                                        title="Restore to Selection Pool"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                      </motion.button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
