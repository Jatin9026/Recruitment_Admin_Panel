import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Search,
  CheckCircle2,
  UserCheck,
  Calendar,
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  ChevronDown,
  ChevronUp,
  Filter,
  Award,
  Loader2,
  AlertCircle,
  TrendingUp,
  Play,
  Pause,
  Settings,
  Zap,
  RotateCcw,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../utils/apiConfig';
import { 
  autoScheduler, 
  startAutoScheduling, 
  stopAutoScheduling, 
  updateBatchSize, 
  getSchedulerStatus,
  resetScheduler 
} from '../../utils/groupAssign';

const SlotAttendance = () => {
  const [applicants, setApplicants] = useState([]);
  const [slotGroups, setSlotGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSlots, setExpandedSlots] = useState(new Set());
  const [markingPresent, setMarkingPresent] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all'); // all, present, not-marked
  const [stats, setStats] = useState({
    totalSlots: 0,
    totalApplicants: 0,
    presentCount: 0,
    notMarkedCount: 0,
    completionRate: 0
  });

  // Auto-scheduler state
  const [autoSchedulerActive, setAutoSchedulerActive] = useState(false);
  const [batchSize, setBatchSize] = useState(5);
  const [schedulerStats, setSchedulerStats] = useState({
    isRunning: false,
    processedCount: 0,
    lastProcessTime: 0,
    lastBatchTime: null
  });
  const [showSchedulerConfig, setShowSchedulerConfig] = useState(false);

  useEffect(() => {
    fetchApplicants();
    
    // Initialize auto-scheduler callback
    autoScheduler.configure({
      onScheduleCallback: handleSchedulerUpdate
    });

    // Cleanup on unmount
    return () => {
      stopAutoScheduling();
    };
  }, []);

  useEffect(() => {
    groupBySlots();
    calculateStats();
  }, [applicants, searchTerm, filterStatus]);

  // Update scheduler stats periodically
  useEffect(() => {
    const updateSchedulerStats = () => {
      const status = getSchedulerStatus();
      setSchedulerStats(status);
      setAutoSchedulerActive(status.isRunning);
    };

    // Update immediately
    updateSchedulerStats();

    // Update every 2 seconds when scheduler is running
    const interval = setInterval(updateSchedulerStats, 2000);
    
    return () => clearInterval(interval);
  }, [autoSchedulerActive]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setApplicants(data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast.error('Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  // Handle scheduler updates
  const handleSchedulerUpdate = (update) => {
    console.log('Scheduler update:', update);
    
    if (update.type === 'batch_scheduled') {
      // Update scheduler stats silently without refreshing the page
      setSchedulerStats(prev => ({
        ...prev,
        processedCount: prev.processedCount + update.applicants.length,
        lastBatchTime: update.timestamp
      }));

      // Show subtle notification without refreshing data
      toast.success(`Auto-scheduled ${update.applicants.length} applicants!`, {
        description: `Batch processed at ${update.timestamp.toLocaleTimeString()}`,
        duration: 3000
      });

      // Note: We don't call fetchApplicants() here to avoid page reload
      // The scheduler handles its own data state independently
    }
  };

  // Toggle auto-scheduler
  const toggleAutoScheduler = () => {
    if (autoSchedulerActive) {
      stopAutoScheduling();
      setAutoSchedulerActive(false);
    } else {
      startAutoScheduling({
        batchSize: batchSize,
        onScheduleCallback: handleSchedulerUpdate
      });
      setAutoSchedulerActive(true);
    }
  };

  // Update batch size
  const handleBatchSizeChange = (newSize) => {
    setBatchSize(newSize);
    updateBatchSize(newSize);
  };

  // Reset scheduler
  const handleResetScheduler = () => {
    resetScheduler();
    toast.info('Scheduler reset - cleared processed applicants');
  };

  const groupBySlots = () => {
    // Filter applicants based on search and assigned slots
    const filteredApplicants = applicants.filter(applicant => {
      // Must have assigned slot
      if (!applicant.assignedSlot) return false;

      // Search filter
      const matchesSearch = 
        applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.lib_id?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (filterStatus === 'present') {
        matchesStatus = applicant.isPresent === true;
      } else if (filterStatus === 'not-marked') {
        matchesStatus = applicant.isPresent !== true;
      }

      return matchesSearch && matchesStatus;
    });

    // Group by assigned slot
    const grouped = filteredApplicants.reduce((acc, applicant) => {
      const slotKey = applicant.assignedSlot;
      if (!acc[slotKey]) {
        acc[slotKey] = [];
      }
      acc[slotKey].push(applicant);
      return acc;
    }, {});

    // Sort slots by start time (ascending)
    const sortedSlots = {};
    const sortedSlotKeys = Object.keys(grouped).sort((a, b) => {
      try {
        const dateA = new Date(a.split(' - ')[0]);
        const dateB = new Date(b.split(' - ')[0]);
        return dateA - dateB;
      } catch {
        return a.localeCompare(b);
      }
    });

    sortedSlotKeys.forEach(key => {
      // Sort applicants within each slot alphabetically
      sortedSlots[key] = grouped[key].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
    });

    setSlotGroups(sortedSlots);
  };

  const calculateStats = () => {
    const totalSlots = Object.keys(slotGroups).length;
    const totalApplicants = applicants.filter(a => a.assignedSlot).length;
    const presentCount = applicants.filter(a => a.assignedSlot && a.isPresent === true).length;
    const notMarkedCount = totalApplicants - presentCount;
    const completionRate = totalApplicants > 0 ? Math.round((presentCount / totalApplicants) * 100) : 0;

    setStats({
      totalSlots,
      totalApplicants,
      presentCount,
      notMarkedCount,
      completionRate
    });
  };

  const toggleSlotExpansion = (slotKey) => {
    const newExpanded = new Set(expandedSlots);
    if (newExpanded.has(slotKey)) {
      newExpanded.delete(slotKey);
    } else {
      newExpanded.add(slotKey);
    }
    setExpandedSlots(newExpanded);
  };

  const markApplicantPresent = async (applicant) => {
    if (markingPresent.has(applicant.email)) return;

    try {
      setMarkingPresent(prev => new Set(prev).add(applicant.email));
      
      await apiClient.updateUserAttendance(applicant.email, true);
      
      // Update local state
      setApplicants(prev => 
        prev.map(a => 
          a.email === applicant.email 
            ? { ...a, isPresent: true }
            : a
        )
      );
      
      toast.success(`${applicant.name} marked as present`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(`Failed to mark ${applicant.name} as present`);
    } finally {
      setMarkingPresent(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicant.email);
        return newSet;
      });
    }
  };

  const parseSlotTime = (slotString) => {
    if (!slotString) return null;
    try {
      const [start, end] = slotString.split(' - ');
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      return {
        start: startDate,
        end: endDate,
        startFormatted: startDate.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        endFormatted: endDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        date: startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timeRange: `${startDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })} - ${endDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}`
      };
    } catch {
      return null;
    }
  };

  const getSlotStats = (slotApplicants) => {
    const total = slotApplicants.length;
    const present = slotApplicants.filter(a => a.isPresent === true).length;
    const notMarked = total - present;
    const completionRate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, notMarked, completionRate };
  };

  const getStatusColor = (isPresent) => {
    if (isPresent === true) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
                Slot-based Attendance
              </h1>
              <p className="text-gray-600 mt-1">
                Mark attendance for applicants organized by their assigned time slots
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSchedulerConfig(!showSchedulerConfig)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Auto-Scheduler
              </button>
              
              <button
                onClick={fetchApplicants}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Auto-Scheduler Configuration Panel */}
        <AnimatePresence>
          {showSchedulerConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Auto-Scheduler Configuration
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Automatically create rounds when enough applicants are present
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Batch Size Configuration */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Batch Size:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={batchSize}
                      onChange={(e) => handleBatchSizeChange(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${autoSchedulerActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {autoSchedulerActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAutoScheduler}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        autoSchedulerActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {autoSchedulerActive ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleResetScheduler}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Reset processed applicants"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scheduler Stats */}
              {autoSchedulerActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-700">Batch Size</p>
                      <p className="text-lg font-bold text-purple-900">{schedulerStats.batchSize || batchSize}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-700">Processed</p>
                      <p className="text-lg font-bold text-green-900">{schedulerStats.processedCount}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-700">Check Interval</p>
                      <p className="text-lg font-bold text-blue-900">5s</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700">Round Duration</p>
                      <p className="text-lg font-bold text-gray-900">10min</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-orange-700">Last Batch</p>
                      <p className="text-lg font-bold text-orange-900">
                        {schedulerStats.lastBatchTime 
                          ? schedulerStats.lastBatchTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          : 'None'
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSlots}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplicants}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.presentCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Marked</p>
                <p className="text-2xl font-bold text-gray-600">{stats.notMarkedCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or library ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Applicants</option>
                <option value="present">Present</option>
                <option value="not-marked">Not Marked</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Slot Groups */}
        <div className="space-y-4">
          {Object.keys(slotGroups).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
            >
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Slots Found</h3>
              <p className="text-gray-600">No applicants with assigned slots match your current filters.</p>
            </motion.div>
          ) : (
            Object.entries(slotGroups).map(([slotKey, slotApplicants], index) => {
              const slotInfo = parseSlotTime(slotKey);
              const slotStats = getSlotStats(slotApplicants);
              
              return (
                <motion.div
                  key={slotKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Slot Header */}
                  <div
                    onClick={() => toggleSlotExpansion(slotKey)}
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {slotInfo ? slotInfo.date : 'Invalid Slot'}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              slotStats.completionRate === 100 
                                ? 'bg-green-100 text-green-800'
                                : slotStats.present > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {slotStats.completionRate}% Complete
                            </span>
                          </div>
                          
                          {slotInfo && (
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-700">
                                {slotInfo.timeRange}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{slotStats.total} applicants</span>
                            <span>•</span>
                            <span className="text-green-600 font-medium">{slotStats.present} present</span>
                            <span>•</span>
                            <span className="text-gray-600 font-medium">{slotStats.notMarked} not marked</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {expandedSlots.has(slotKey) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slot Content */}
                  <AnimatePresence>
                    {expandedSlots.has(slotKey) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 bg-gray-50"
                      >
                        <div className="p-6">
                          <div className="space-y-4">
                            {slotApplicants.map((applicant, applicantIndex) => (
                              <motion.div
                                key={applicant.email}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: applicantIndex * 0.05 }}
                                className={`relative bg-white rounded-lg p-4 border-l-4 transition-all duration-200 hover:shadow-md ${
                                  applicant.isPresent === true
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300'
                                }`}
                              >
                                {/* Status indicator */}
                                {applicant.isPresent === true && (
                                  <div className="absolute top-2 right-2">
                                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      PRESENT
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-20">
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-blue-600" />
                                        <span className="font-semibold text-gray-900">{applicant.name || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-gray-700">{applicant.email}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <GraduationCap className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm text-gray-700 font-medium">{applicant.branch || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Award className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm text-gray-700">Year {applicant.year || 'N/A'}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{applicant.phone || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{applicant.lib_id || 'N/A'}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-gray-600 font-medium">Attendance Status</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.isPresent)}`}>
                                          {applicant.isPresent === true ? 'Present' : 'Not Marked'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="absolute bottom-4 right-4">
                                    {applicant.isPresent === true ? (
                                      <div className="p-2 rounded-lg bg-green-100 text-green-600 shadow-sm border border-green-300 cursor-not-allowed" title="Already marked present">
                                        <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                    ) : (
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => markApplicantPresent(applicant)}
                                        disabled={markingPresent.has(applicant.email)}
                                        className="p-2 rounded-lg transition-colors bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        title="Mark as present"
                                      >
                                        {markingPresent.has(applicant.email) ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <UserCheck className="w-4 h-4" />
                                        )}
                                      </motion.button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotAttendance;