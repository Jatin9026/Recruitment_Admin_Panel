import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  XCircle,
  AlertCircle,
  Settings,
  UserCheck,
  Plus,
  Minus,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../utils/apiConfig';
import ApplicantDetailModal, { getGender, isHosteler } from '../../components/ApplicantDetailModal';

const BulkSlotAssignment = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, assigned, unassigned
  const [assignmentCount, setAssignmentCount] = useState(5);
  const [slotDateTime, setSlotDateTime] = useState('');
  const [slotEndDateTime, setSlotEndDateTime] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  
  // Applicant Detail Modal
  const [selectedApplicantForModal, setSelectedApplicantForModal] = useState(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);

  // New filters / ordering
  const [priorityTop, setPriorityTop] = useState('default'); // default | girls_nonhostel | boys_nonhostel | girls_hostel | boys_hostel

  useEffect(() => {
    fetchApplicants();
  }, []);

  // Optimized filtering using useMemo for immediate response
  const filteredApplicants = useMemo(() => {
    if (!applicants.length) return [];
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    let filtered = applicants.filter(applicant => {
      // Search filter - check if search term is empty to avoid unnecessary processing
      if (searchLower) {
        const matchesSearch = 
          (applicant.name && applicant.name.toLowerCase().includes(searchLower)) ||
          (applicant.email && applicant.email.toLowerCase().includes(searchLower)) ||
          (applicant.lib_id && applicant.lib_id.toString().toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      switch (filterType) {
        case 'assigned':
          return Boolean(applicant.assignedSlot);
        case 'unassigned':
          return !applicant.assignedSlot;
        default: // 'all'
          return true;
      }

      return true;
    });

    // Build ordering array based on priorityTop selection.
    // Base sequence (default): girls_nonhostel, boys_nonhostel, girls_hostel, boys_hostel
    const baseOrder = ['girls_nonhostel', 'boys_nonhostel', 'girls_hostel', 'boys_hostel'];
    const buildOrder = (top) => {
      if (!top || top === 'default') return baseOrder;
      // put selected top first, then the remaining in baseOrder sequence preserving relative order
      return [top, ...baseOrder.filter(g => g !== top)];
    };

    const order = buildOrder(priorityTop);

    const groupOf = (app) => {
      const g = getGender(app); // 'female'|'male'|'other'
      const h = isHosteler(app); // boolean
      if (g === 'female' && !h) return 'girls_nonhostel';
      if (g === 'male' && !h) return 'boys_nonhostel';
      if (g === 'female' && h) return 'girls_hostel';
      if (g === 'male' && h) return 'boys_hostel';
      // unknown/other goes to end
      return 'other';
    };

    const priorityRank = (app) => {
      const grp = groupOf(app);
      const idx = order.indexOf(grp);
      return idx === -1 ? order.length : idx;
    };

    // If a specific priority is selected, sort by that group order.
    // If "default" is selected, do not apply group-priority ordering — use baseline sort.
    if (priorityTop && priorityTop !== 'default') {
      filtered.sort((a, b) => {
        const pa = priorityRank(a);
        const pb = priorityRank(b);
        if (pa !== pb) return pa - pb;
        // fallback: unassigned first then name
        if (!a.assignedSlot && b.assignedSlot) return -1;
        if (a.assignedSlot && !b.assignedSlot) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
    } else {
      // Default behaviour: no group priority — keep a neutral ordering:
      // unassigned first, then alphabetical by name.
      filtered.sort((a, b) => {
        if (!a.assignedSlot && b.assignedSlot) return -1;
        if (a.assignedSlot && !b.assignedSlot) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    return filtered;
  }, [applicants, searchTerm, filterType, priorityTop]);

  // Calculate stats using useMemo for performance
  const stats = useMemo(() => {
    const total = applicants.length;
    const assigned = applicants.filter(a => a.assignedSlot).length;
    const unassigned = total - assigned;
    
    return { total, assigned, unassigned };
  }, [applicants]);

  const fetchApplicants = useCallback(async () => {
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
  }, []);

  const handleSelectApplicant = useCallback((applicant) => {
    if (applicant.assignedSlot) {
      toast.warning('This applicant already has an assigned slot');
      return;
    }

    setSelectedApplicants(prev => {
      const isSelected = prev.find(a => a.id === applicant.id);
      if (isSelected) {
        return prev.filter(a => a.id !== applicant.id);
      } else {
        return [...prev, applicant];
      }
    });
  }, []);

  const handleSelectUnassigned = useCallback((count) => {
    const unassignedApplicants = filteredApplicants.filter(a => !a.assignedSlot);
    const toSelect = unassignedApplicants.slice(0, count);
    setSelectedApplicants(toSelect);
    toast.success(`Selected ${toSelect.length} unassigned applicants`);
  }, [filteredApplicants]);

  const handleClearSelection = useCallback(() => {
    setSelectedApplicants([]);
    toast.info('Selection cleared');
  }, []);

  const formatSlotTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toISOString()} - ${end.toISOString()}`;
  };

  const handleAssignSlots = async () => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select at least one applicant');
      return;
    }

    if (!slotDateTime || !slotEndDateTime) {
      toast.error('Please provide both start and end times');
      return;
    }

    const startTime = new Date(slotDateTime);
    const endTime = new Date(slotEndDateTime);

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setIsAssigning(true);
      const emails = selectedApplicants.map(a => a.email);
      const assignedSlot = formatSlotTime(startTime, endTime);

      await apiClient.bulkAssignSlots(emails, assignedSlot);
      
      toast.success(`Successfully assigned slots to ${selectedApplicants.length} applicants`);
      
      // Refresh data
      await fetchApplicants();
      setSelectedApplicants([]);
      setShowSlotModal(false);
      setSlotDateTime('');
      setSlotEndDateTime('');
    } catch (error) {
      console.error('Error assigning slots:', error);
      toast.error('Failed to assign slots: ' + error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (applicant) => {
    if (applicant.assignedSlot) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (applicant) => {
    if (applicant.assignedSlot) return <CheckCircle2 className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const parseSlotTime = (slotString) => {
    if (!slotString) return null;
    try {
      const [start, end] = slotString.split(' - ');
      return {
        start: new Date(start).toLocaleString(),
        end: new Date(end).toLocaleString()
      };
    } catch {
      return null;
    }
  };

  const handleViewApplicant = (applicant) => {
    setSelectedApplicantForModal(applicant);
    setShowApplicantModal(true);
  };

  const closeApplicantModal = () => {
    setShowApplicantModal(false);
    setSelectedApplicantForModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading applicants...</p>
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
                <Clock className="w-8 h-8 text-blue-600" />
                Bulk Slot Assignment
              </h1>
              <p className="text-gray-600 mt-1">
                Assign time slots to multiple applicants efficiently
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">             
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchApplicants}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Slots Assigned</p>
                <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unassigned}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Selection Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-2/4 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or library ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Existing Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Applicants</option>
                <option value="assigned">Assigned Slots</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* removed category filter - only priorityTop dropdown remains */}

            {/* Priority dropdown: choose which group should be top */}
            <div className="relative">
              <label htmlFor="priorityTop" className="sr-only">Priority Top</label>
              <select
                id="priorityTop"
                value={priorityTop}
                onChange={(e) => setPriorityTop(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                title="Choose group to prioritize first"
              >
                <option value="default">Default priority</option>
                <option value="girls_nonhostel">Girls — Non‑Hostel first</option>
                <option value="boys_nonhostel">Boys — Non‑Hostel first</option>
                <option value="girls_hostel">Girls — Hostel first</option>
                <option value="boys_hostel">Boys — Hostel first</option>
              </select>
            </div>

            {/* Quick Selection */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <button
                  onClick={() => setAssignmentCount(Math.max(0, assignmentCount - 5))}
                  className="w-8 h-8 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{assignmentCount}</span>
                <button
                  onClick={() => setAssignmentCount(assignmentCount + 5)}
                  className="w-8 h-8 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => handleSelectUnassigned(assignmentCount)}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Select {assignmentCount} Unassigned
              </button>
              {selectedApplicants.length > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Applicants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Applicants ({filteredApplicants.length})
                {(searchTerm || filterType !== 'all') && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Filtered
                  </span>
                )}
              </h2>
              
              {selectedApplicants.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowSlotModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Assign Slots ({selectedApplicants.length})
                </motion.button>
              )}
            </div>
            {selectedApplicants.length > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                {selectedApplicants.length} applicant(s) selected for slot assignment
              </p>
            )}
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-1">
                Showing results for "{searchTerm}"
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>

                  {/* NEW: Gender column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>

                  {/* NEW: Hostel column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplicants.map((applicant, index) => {
                  const isSelected = selectedApplicants.find(a => a.id === applicant.id);
                  const slotInfo = parseSlotTime(applicant.assignedSlot);
                  const gender = getGender(applicant); // 'female'|'male'|'other'
                  const host = isHosteler(applicant); // boolean
                  
                  return (
                    <motion.tr
                      key={applicant.id}
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        duration: 0.1,
                        ease: "easeOut"
                      }}
                      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${applicant.assignedSlot ? 'opacity-75' : ''}`}
                    >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => handleSelectApplicant(applicant)}
                            disabled={!!applicant.assignedSlot}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                              {applicant.name?.charAt(0)?.toUpperCase() || 'N'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {applicant.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {applicant.lib_id || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{applicant.email}</div>
                          <div className="text-sm text-gray-500">{applicant.phone || 'N/A'}</div>
                        </td>

                        {/* Gender cell */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-sm ${
                            gender === 'female' ? 'bg-pink-50 text-pink-700' :
                            gender === 'male' ? 'bg-blue-50 text-blue-700' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {gender === 'female' ? 'Girl' : gender === 'male' ? 'Boy' : 'Other'}
                          </span>
                        </td>

                        {/* Hostel cell */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-sm ${
                            host ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {host ? 'Hostel' : 'Non‑Hostel'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-break-spaces">
                          <div className="text-sm text-gray-900">Year {applicant.year || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{applicant.branch || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant)}`}>
                            {getStatusIcon(applicant)}
                            {applicant.assignedSlot ? 'Assigned' : 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {slotInfo ? (
                            <div className="text-sm">
                              <div className="text-gray-900 font-medium">
                                {slotInfo.start}
                              </div>
                              <div className="text-gray-500">
                                to {slotInfo.end}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewApplicant(applicant)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Slot Assignment Modal */}
      <AnimatePresence>
        {showSlotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Time Slot</h3>
                  <p className="text-sm text-gray-600">
                    Assigning slots to {selectedApplicants.length} applicants
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={slotDateTime}
                    onChange={(e) => setSlotDateTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={slotEndDateTime}
                    onChange={(e) => setSlotEndDateTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {slotDateTime && slotEndDateTime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Preview:</strong><br />
                      {new Date(slotDateTime).toLocaleString()} - {new Date(slotEndDateTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleAssignSlots}
                  disabled={isAssigning || !slotDateTime || !slotEndDateTime}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isAssigning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Assign Slots
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSlotModal(false)}
                  disabled={isAssigning}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applicant Detail Modal */}
      {showApplicantModal && selectedApplicantForModal && (
        <ApplicantDetailModal
          applicant={selectedApplicantForModal}
          onClose={closeApplicantModal}
        />
      )}
    </div>
  );
};

export default BulkSlotAssignment;
