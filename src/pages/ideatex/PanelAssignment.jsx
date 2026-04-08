import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, AlertCircle, Users, Calendar, Edit2, CheckCircle,
  XCircle, Clock, Plus, Trash2, MapPin, UserCheck, LayoutGrid, Timer
} from 'lucide-react';
import { ideatexApiClient } from '../../utils/ideatexApiConfig';

// â”€â”€â”€ Reusable toast banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Toast = ({ result, onClose }) => {
  if (!result) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-lg shadow-sm border p-4 mb-6 ${
        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start space-x-3">
        {result.success
          ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          : <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />}
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
            {result.success ? 'Success!' : 'Error'}
          </h3>
          <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PanelAssignment = () => {
  // Shared
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'panels' | 'slots'
  const [result, setResult] = useState(null);

  // Teams (assign tab)
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentType, setAssignmentType] = useState('panel');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // 'all' | 'verified' | 'unverified'
  const [assignedFilter, setAssignedFilter] = useState('all'); // 'all' | 'panel' | 'slot' | 'none'

  // Panels
  const [panels, setPanels] = useState([]);
  const [panelsLoading, setPanelsLoading] = useState(false);
  const [panelForm, setPanelForm] = useState({
    name: '', description: '', venue: '', evaluators: '', isActive: true
  });
  const [panelFormOpen, setPanelFormOpen] = useState(false);
  const [deletingPanel, setDeletingPanel] = useState(null);

  // Time Slots
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotForm, setSlotForm] = useState({
    label: '', startTime: '', endTime: ''
  });
  const [slotFormOpen, setSlotFormOpen] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchPanels();
    fetchTimeSlots();
  }, []);

  useEffect(() => {
    let filtered = [...teams];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (team) =>
          team.teamName?.toLowerCase().includes(q) ||
          team.teamCode?.toLowerCase().includes(q) ||
          team.panel?.toLowerCase().includes(q)
      );
    }

    // Verified filter
    if (verifiedFilter === 'verified') {
      filtered = filtered.filter(t => t.isVerified);
    } else if (verifiedFilter === 'unverified') {
      filtered = filtered.filter(t => !t.isVerified);
    }

    // Assignment filter
    if (assignedFilter === 'panel') {
      filtered = filtered.filter(t => t.panel);
    } else if (assignedFilter === 'slot') {
      filtered = filtered.filter(t => t.slot);
    } else if (assignedFilter === 'none') {
      filtered = filtered.filter(t => !t.panel && !t.slot);
    }

    setFilteredTeams(filtered);
  }, [searchQuery, verifiedFilter, assignedFilter, teams]);

  // â”€â”€ Data fetchers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchTeams = async () => {
    try {
      setTeamsLoading(true);
      const response = await ideatexApiClient.getAllTeams();
      const teamsData = response.data?.teams || response.teams || [];
      setTeams(teamsData);
      setFilteredTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
      showResult(false, 'Failed to load teams');
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchPanels = async () => {
    try {
      setPanelsLoading(true);
      const response = await ideatexApiClient.getAllPanels();
      setPanels(response.data?.panels || []);
    } catch (error) {
      console.error('Error fetching panels:', error);
    } finally {
      setPanelsLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      setSlotsLoading(true);
      const response = await ideatexApiClient.getAllTimeSlots();
      setTimeSlots(response.data?.slots || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setSlotsLoading(false);
    }
  };

  // â”€â”€ Shared helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const showResult = (success, message) => {
    setResult({ success, message });
    if (success) setTimeout(() => setResult(null), 3000);
  };

  // â”€â”€ Team assignment handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleIndividualAssign = (teamId, type) => {
    setEditingTeam(teamId);
    setEditValue('');
    setAssignmentType(type);
  };

  const saveIndividualAssignment = async () => {
    if (!editValue.trim()) {
      alert(`Please select a ${assignmentType}`);
      return;
    }
    try {
      if (assignmentType === 'panel') {
        await ideatexApiClient.assignPanel(editingTeam, editValue);
      } else {
        await ideatexApiClient.assignSlot(editingTeam, editValue);
      }
      showResult(true, `${assignmentType === 'panel' ? 'Panel' : 'Slot'} assigned successfully!`);
      setEditingTeam(null);
      setEditValue('');
      fetchTeams();
    } catch (error) {
      showResult(false, error.message || `Failed to assign ${assignmentType}`);
    }
  };

  const toggleTeamSelection = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const isTeamSelectable = (team) => {
    if (!bulkMode) return true;
    return assignmentType === 'panel' ? !team.panel : !team.slot;
  };

  const handleBulkAssign = async (value) => {
    if (selectedTeams.length === 0) { alert('Please select at least one team'); return; }
    if (!value) { alert(`Please select a ${assignmentType}`); return; }
    try {
      setTeamsLoading(true);
      const assignments = selectedTeams.map(teamId => ({ teamId, [assignmentType]: value }));
      let response;
      if (assignmentType === 'panel') {
        response = await ideatexApiClient.bulkAssignPanels(assignments);
      } else {
        response = await ideatexApiClient.bulkAssignSlots(assignments);
      }
      showResult(true, response.message || 'Bulk assignment completed successfully!');
      setSelectedTeams([]);
      setBulkMode(false);
      setEditValue('');
      fetchTeams();
    } catch (error) {
      showResult(false, error.message || 'Failed to complete bulk assignment');
    } finally {
      setTeamsLoading(false);
    }
  };

  // â”€â”€ Panel CRUD handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreatePanel = async (e) => {
    e.preventDefault();
    if (!panelForm.name.trim()) { alert('Panel name is required'); return; }
    try {
      const payload = {
        name: panelForm.name.trim(),
        description: panelForm.description.trim(),
        venue: panelForm.venue.trim(),
        evaluators: panelForm.evaluators
          ? panelForm.evaluators.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        isActive: panelForm.isActive,
      };
      await ideatexApiClient.createPanel(payload);
      showResult(true, `Panel "${payload.name}" created successfully!`);
      setPanelForm({ name: '', description: '', venue: '', evaluators: '', isActive: true });
      setPanelFormOpen(false);
      fetchPanels();
    } catch (error) {
      showResult(false, error.message || 'Failed to create panel');
    }
  };

  const handleDeletePanel = async (id) => {
    try {
      setDeletingPanel(id);
      await ideatexApiClient.deletePanel(id);
      showResult(true, 'Panel deleted successfully');
      fetchPanels();
    } catch (error) {
      showResult(false, error.message || 'Failed to delete panel');
    } finally {
      setDeletingPanel(null);
    }
  };

  // â”€â”€ Time Slot CRUD handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreateTimeSlot = async (e) => {
    e.preventDefault();
    if (!slotForm.label.trim() || !slotForm.startTime || !slotForm.endTime) {
      alert('Label, start time and end time are required');
      return;
    }
    try {
      await ideatexApiClient.createTimeSlot({
        label: slotForm.label.trim(),
        startTime: new Date(slotForm.startTime).toISOString(),
        endTime: new Date(slotForm.endTime).toISOString(),
      });
      showResult(true, `Time slot "${slotForm.label}" created successfully!`);
      setSlotForm({ label: '', startTime: '', endTime: '' });
      setSlotFormOpen(false);
      fetchTimeSlots();
    } catch (error) {
      showResult(false, error.message || 'Failed to create time slot');
    }
  };

  const handleDeleteTimeSlot = async (id) => {
    try {
      setDeletingSlot(id);
      await ideatexApiClient.deleteTimeSlot(id);
      showResult(true, 'Time slot deleted successfully');
      fetchTimeSlots();
    } catch (error) {
      showResult(false, error.message || 'Failed to delete time slot');
    } finally {
      setDeletingSlot(null);
    }
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-purple-600" />
            Panel &amp; Slot Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage panels, time slots, and assign them to teams
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {[
            { key: 'assign', label: 'Assign Teams', icon: Users },
            { key: 'panels', label: 'Manage Panels', icon: LayoutGrid },
            { key: 'slots', label: 'Manage Slots', icon: Timer },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Toast */}
        <AnimatePresence>
          {result && <Toast result={result} onClose={() => setResult(null)} />}
        </AnimatePresence>

        {/* â”€â”€ ASSIGN TEAMS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'assign' && (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
            >
              {[
                { label: 'Total Teams', value: teams.length, color: 'blue', Icon: Users },
                { label: 'Panels Assigned', value: teams.filter(t => t.panel).length, color: 'purple', Icon: ClipboardList },
                { label: 'Slots Assigned', value: teams.filter(t => t.slot).length, color: 'blue', Icon: Calendar },
              ].map(({ label, value, color, Icon }) => (
                <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{label}</p>
                      <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between flex-wrap gap-3"
            >
              <span className="text-sm font-medium text-gray-700">Assignment Mode:</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setBulkMode(false); setSelectedTeams([]); setEditValue(''); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!bulkMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Individual
                </button>
                <button
                  onClick={() => { setBulkMode(true); setEditValue(''); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${bulkMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Bulk
                </button>
              </div>
            </motion.div>

            {/* Bulk Controls */}
            {bulkMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Assignment</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {['panel', 'slot'].map(type => (
                    <button
                      key={type}
                      onClick={() => { setAssignmentType(type); setEditValue(''); }}
                      className={`py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        assignmentType === type
                          ? type === 'panel' ? 'bg-purple-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'panel' ? <ClipboardList className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                      Assign {type === 'panel' ? 'Panel' : 'Slot'}
                    </button>
                  ))}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Selected: <strong>{selectedTeams.length}</strong> team(s)
                  </p>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {assignmentType === 'panel' ? 'Select Panel' : 'Select Time Slot'}
                      </label>
                      {assignmentType === 'panel' ? (
                        <select
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                        >
                          <option value="">-- Select Panel --</option>
                          {panels.map(p => (
                            <option key={p._id} value={p.name}>{p.name}{p.venue ? ` (${p.venue})` : ''}</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                          <option value="">-- Select Time Slot --</option>
                          {timeSlots.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.label} — {new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}–{new Date(s.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <button
                      onClick={() => handleBulkAssign(editValue)}
                      disabled={selectedTeams.length === 0 || !editValue}
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-md whitespace-nowrap"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Assign to {selectedTeams.length} Team{selectedTeams.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search + Filters */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by team name, code, or panel..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                />
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-500 mr-1">Status:</span>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'unverified', label: 'Unverified' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setVerifiedFilter(value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      verifiedFilter === value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}

                <span className="text-xs font-medium text-gray-500 ml-3 mr-1">Assignment:</span>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'panel', label: 'Panel Assigned' },
                  { value: 'slot', label: 'Slot Assigned' },
                  { value: 'none', label: 'None Assigned' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setAssignedFilter(value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      assignedFilter === value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}

                {(verifiedFilter !== 'all' || assignedFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={() => { setVerifiedFilter('all'); setAssignedFilter('all'); setSearchQuery(''); }}
                    className="ml-auto px-3 py-1 rounded-full text-xs font-medium text-red-600 border border-red-300 hover:bg-red-50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Teams Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Teams ({filteredTeams.length})
                  {(searchQuery || verifiedFilter !== 'all' || assignedFilter !== 'all') && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Filtered
                    </span>
                  )}
                </h2>
                {bulkMode && selectedTeams.length > 0 && (
                  <p className="text-sm text-purple-600 mt-2">
                    {selectedTeams.length} team(s) selected
                  </p>
                )}
              </div>
              <div className="p-6">
                {teamsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredTeams.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {bulkMode && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Panel</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          {!bulkMode && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTeams.map(team => {
                          const isSelectable = isTeamSelectable(team);
                          const isSelected = selectedTeams.includes(team._id);
                          return (
                            <tr
                              key={team._id}
                              className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-purple-50' : ''} ${!isSelectable && bulkMode ? 'opacity-50' : ''}`}
                            >
                              {bulkMode && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleTeamSelection(team._id)}
                                    disabled={!isSelectable}
                                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded"
                                  />
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                                    {team.teamName?.charAt(0)?.toUpperCase() || 'T'}
                                  </div>
                                  <div className="ml-4 text-sm font-medium text-gray-900">{team.teamName || 'N/A'}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {team.teamCode || 'N/A'}
                                </span>
                              </td>
                              {/* Panel cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingTeam === team._id && assignmentType === 'panel' ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={editValue}
                                      onChange={e => setEditValue(e.target.value)}
                                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 bg-white"
                                      autoFocus
                                    >
                                      <option value="">-- Select --</option>
                                      {panels.map(p => (
                                        <option key={p._id} value={p.name}>{p.name}{p.venue ? ` (${p.venue})` : ''}</option>
                                      ))}
                                    </select>
                                    <button onClick={saveIndividualAssignment} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button>
                                    <button onClick={() => { setEditingTeam(null); setEditValue(''); }} className="text-red-600 hover:text-red-700"><XCircle className="w-4 h-4" /></button>
                                  </div>
                                ) : team.panel ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{team.panel}</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">Not Assigned</span>
                                )}
                              </td>
                              {/* Slot cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingTeam === team._id && assignmentType === 'slot' ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={editValue}
                                      onChange={e => setEditValue(e.target.value)}
                                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                                      autoFocus
                                    >
                                      <option value="">-- Select --</option>
                                      {timeSlots.map(s => (
                                        <option key={s._id} value={s._id}>
                                          {s.label} — {new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}–{new Date(s.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </option>
                                      ))}
                                    </select>
                                    <button onClick={saveIndividualAssignment} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button>
                                    <button onClick={() => { setEditingTeam(null); setEditValue(''); }} className="text-red-600 hover:text-red-700"><XCircle className="w-4 h-4" /></button>
                                  </div>
                                ) : team.slot ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {(() => {
                                      const matched = timeSlots.find(s => s._id === team.slot);
                                      if (matched) return `${matched.label} (${new Date(matched.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}–${new Date(matched.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })})`;
                                      const d = new Date(team.slot);
                                      return isNaN(d) ? team.slot : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    })()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">Not Assigned</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {team.isVerified ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Clock className="w-3 h-3 mr-1" />Pending
                                  </span>
                                )}
                              </td>
                              {!bulkMode && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleIndividualAssign(team._id, 'panel')}
                                      disabled={editingTeam !== null}
                                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-medium bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
                                    >
                                      <Edit2 className="w-3 h-3" />Panel
                                    </button>
                                    <button
                                      onClick={() => handleIndividualAssign(team._id, 'slot')}
                                      disabled={editingTeam !== null}
                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
                                    >
                                      <Calendar className="w-3 h-3" />Slot
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2">No teams found</p>
                    <p className="text-sm text-gray-400">
                      {searchQuery ? 'Try adjusting your search query' : 'Teams will appear here once added to the system'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* â”€â”€ MANAGE PANELS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'panels' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Panels ({panels.length})
              </h2>
              <button
                onClick={() => setPanelFormOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {panelFormOpen ? 'Cancel' : 'Create Panel'}
              </button>
            </div>

            {/* Create Panel Form */}
            <AnimatePresence>
              {panelFormOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreatePanel}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 overflow-hidden"
                >
                  <h3 className="text-base font-semibold text-gray-900 mb-4">New Panel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={panelForm.name}
                        onChange={e => setPanelForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Panel-1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                      <input
                        type="text"
                        value={panelForm.venue}
                        onChange={e => setPanelForm(f => ({ ...f, venue: e.target.value }))}
                        placeholder="e.g. Room 101"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={panelForm.description}
                        onChange={e => setPanelForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Brief description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Evaluators <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                      <input
                        type="text"
                        value={panelForm.evaluators}
                        onChange={e => setPanelForm(f => ({ ...f, evaluators: e.target.value }))}
                        placeholder="e.g. Dr. Smith, Prof. Johnson"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="panelActive"
                        checked={panelForm.isActive}
                        onChange={e => setPanelForm(f => ({ ...f, isActive: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <label htmlFor="panelActive" className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Panel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Panels List */}
            {panelsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : panels.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No panels yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Create Panel" to add one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {panels.map(panel => (
                  <motion.div
                    key={panel._id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <LayoutGrid className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{panel.name}</p>
                          {panel.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{panel.description}</p>
                          )}
                        </div>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${panel.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {panel.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {panel.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {panel.venue}
                      </div>
                    )}
                    {panel.evaluators?.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-600">
                        <UserCheck className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{panel.evaluators.join(', ')}</span>
                      </div>
                    )}
                    <div className="flex justify-end pt-1 border-t border-gray-100">
                      <button
                        onClick={() => handleDeletePanel(panel._id)}
                        disabled={deletingPanel === panel._id}
                        className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deletingPanel === panel._id
                          ? <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* â”€â”€ MANAGE SLOTS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'slots' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Time Slots ({timeSlots.length})
              </h2>
              <button
                onClick={() => setSlotFormOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {slotFormOpen ? 'Cancel' : 'Create Slot'}
              </button>
            </div>

            {/* Create Slot Form */}
            <AnimatePresence>
              {slotFormOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateTimeSlot}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 overflow-hidden"
                >
                  <h3 className="text-base font-semibold text-gray-900 mb-4">New Time Slot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={slotForm.label}
                        onChange={e => setSlotForm(f => ({ ...f, label: e.target.value }))}
                        placeholder="e.g. Morning Slot A"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date &amp; Time <span className="text-red-500">*</span></label>
                      <input
                        type="datetime-local"
                        value={slotForm.startTime}
                        onChange={e => setSlotForm(f => ({ ...f, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date &amp; Time <span className="text-red-500">*</span></label>
                      <input
                        type="datetime-local"
                        value={slotForm.endTime}
                        onChange={e => setSlotForm(f => ({ ...f, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Slot
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Slots List */}
            {slotsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Timer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No time slots yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Create Slot" to add one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {timeSlots.map(slot => (
                  <motion.div
                    key={slot._id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Timer className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{slot.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(slot.startTime).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{slot.startTime}</span>
                      <span className="text-gray-400">â€”</span>
                      <span className="font-medium">{slot.endTime}</span>
                    </div>
                    <div className="flex justify-end pt-1 border-t border-gray-100">
                      <button
                        onClick={() => handleDeleteTimeSlot(slot._id)}
                        disabled={deletingSlot === slot._id}
                        className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deletingSlot === slot._id
                          ? <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default PanelAssignment;
