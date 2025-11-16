import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Upload, AlertCircle, Users, Calendar, Edit2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ideatexApiClient } from '../../utils/ideatexApiConfig';

const PanelAssignment = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentType, setAssignmentType] = useState('panel'); // 'panel' or 'slot'
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [result, setResult] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = teams.filter(
        (team) =>
          team.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.teamCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.panel?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams(teams);
    }
  }, [searchQuery, teams]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await ideatexApiClient.getAllTeams();
      const teamsData = response.data?.teams || response.teams || [];
      setTeams(teamsData);
      setFilteredTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualAssign = async (teamId, type) => {
    setEditingTeam(teamId);
    setEditValue('');
    setAssignmentType(type);
  };

  const saveIndividualAssignment = async () => {
    if (!editValue.trim()) {
      alert(`Please enter a ${assignmentType}`);
      return;
    }

    try {
      if (assignmentType === 'panel') {
        await ideatexApiClient.assignPanel(editingTeam, editValue);
      } else {
        // Validate ISO datetime format for slot
        const slotDate = new Date(editValue);
        if (isNaN(slotDate.getTime())) {
          alert('Please enter a valid date-time in ISO format (e.g., 2025-08-01T10:00:00Z)');
          return;
        }
        await ideatexApiClient.assignSlot(editingTeam, editValue);
      }
      
      setResult({
        success: true,
        message: `${assignmentType === 'panel' ? 'Panel' : 'Slot'} assigned successfully!`,
      });
      setEditingTeam(null);
      setEditValue('');
      fetchTeams();
      
      setTimeout(() => setResult(null), 3000);
    } catch (error) {
      console.error(`Error assigning ${assignmentType}:`, error);
      setResult({
        success: false,
        message: error.message || `Failed to assign ${assignmentType}`,
      });
    }
  };

  const toggleTeamSelection = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const isTeamSelectable = (team) => {
    if (!bulkMode) return true;
    
    // In bulk mode, check if team already has what we're trying to assign
    if (assignmentType === 'panel') {
      return !team.panel; // Can't select if panel already assigned
    } else {
      return !team.slot; // Can't select if slot already assigned
    }
  };

  const handleBulkAssign = async (value) => {
    if (selectedTeams.length === 0) {
      alert('Please select at least one team');
      return;
    }

    if (!value) {
      alert(`Please select a ${assignmentType}`);
      return;
    }

    try {
      setLoading(true);
      const assignments = selectedTeams.map(teamId => ({
        teamId,
        [assignmentType]: value
      }));

      let response;
      if (assignmentType === 'panel') {
        response = await ideatexApiClient.bulkAssignPanels(assignments);
      } else {
        response = await ideatexApiClient.bulkAssignSlots(assignments);
      }

      setResult({
        success: true,
        message: response.message || 'Bulk assignment completed successfully!',
        details: response.data,
      });
      setSelectedTeams([]);
      setBulkMode(false);
      setEditValue('');
      fetchTeams();
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to complete bulk assignment',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading teams...</p>
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
                <ClipboardList className="w-8 h-8 text-purple-600" />
                Panel & Slot Assignment
              </h1>
              <p className="text-gray-600 mt-1">
                Assign panels or time slots to teams individually or in bulk
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setBulkMode(false);
                  setSelectedTeams([]);
                  setEditValue('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !bulkMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => {
                  setBulkMode(true);
                  setEditValue('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  bulkMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bulk
              </button>
            </div>
          </div>
        </motion.div>

        {/* Result Banner */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg shadow-sm border p-4 mb-6 ${
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.success ? 'Success!' : 'Error'}
                </h3>
                <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

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
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Panels Assigned</p>
                <p className="text-2xl font-bold text-purple-600">
                  {teams.filter(t => t.panel).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Slots Assigned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {teams.filter(t => t.slot).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bulk Assignment Controls */}
        {bulkMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Bulk Assignment Controls
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  setAssignmentType('panel');
                  setEditValue('');
                }}
                className={`py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  assignmentType === 'panel'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                Assign Panel
              </button>
              <button
                onClick={() => {
                  setAssignmentType('slot');
                  setEditValue('');
                }}
                className={`py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  assignmentType === 'slot'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Assign Slot
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Selected Teams: <span className="text-lg font-bold text-gray-900">{selectedTeams.length}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {assignmentType === 'panel' 
                    ? 'Select teams without panels and assign a panel'
                    : 'Select teams without slots and assign a time slot'}
                </p>
              </div>
              
              <div className="flex items-end gap-4">
                {assignmentType === 'panel' ? (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Panel
                    </label>
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">-- Select Panel --</option>
                      <option value="Panel-1">Panel-1</option>
                      <option value="Panel-2">Panel-2</option>
                      <option value="Panel-3">Panel-3</option>
                      <option value="Panel-4">Panel-4</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date and Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editValue ? new Date(editValue).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditValue(e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                )}
                
                <button
                  onClick={() => handleBulkAssign(editValue)}
                  disabled={selectedTeams.length === 0 || !editValue}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-md whitespace-nowrap"
                >
                  <CheckCircle className="w-5 h-5" />
                  Assign to {selectedTeams.length} Team{selectedTeams.length !== 1 ? 's' : ''}
                </button>
              </div>
              
              {assignmentType === 'slot' && editValue && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Preview:</strong> {new Date(editValue).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    ISO Format: {editValue}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="relative">
            <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by team name, code, or panel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </motion.div>

        {/* Teams Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Teams ({filteredTeams.length})
              {searchQuery && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Filtered
                </span>
              )}
            </h2>
            {bulkMode && selectedTeams.length > 0 && (
              <p className="text-sm text-purple-600 mt-2">
                {selectedTeams.length} team(s) selected for assignment
              </p>
            )}
          </div>
          <div className="p-6">
            {filteredTeams.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {bulkMode && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Panel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {!bulkMode && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">{filteredTeams.map((team) => {
                      const isSelectable = isTeamSelectable(team);
                      const isSelected = selectedTeams.includes(team._id);
                      
                      return (
                      <tr
                        key={team._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-purple-50' : ''
                        } ${!isSelectable && bulkMode ? 'opacity-50' : ''}`}
                      >
                        {bulkMode && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTeamSelection(team._id)}
                              disabled={!isSelectable}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                              {team.teamName?.charAt(0)?.toUpperCase() || 'T'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {team.teamName || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {team.teamCode || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{editingTeam === team._id && assignmentType === 'panel' ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 bg-white"
                                autoFocus
                              >
                                <option value="">-- Select Panel --</option>
                                <option value="Panel-1">Panel-1</option>
                                <option value="Panel-2">Panel-2</option>
                                <option value="Panel-3">Panel-3</option>
                                <option value="Panel-4">Panel-4</option>
                              </select>
                              <button
                                onClick={saveIndividualAssignment}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingTeam(null);
                                  setEditValue('');
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : team.panel ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {team.panel}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Not Assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{editingTeam === team._id && assignmentType === 'slot' ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="datetime-local"
                                  value={editValue ? new Date(editValue).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => setEditValue(e.target.value ? new Date(e.target.value).toISOString() : '')}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                                  autoFocus
                                />
                                <button
                                  onClick={saveIndividualAssignment}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingTeam(null);
                                    setEditValue('');
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : team.slot ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(team.slot).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Not Assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {team.isVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        {!bulkMode && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => handleIndividualAssign(team._id, 'panel')}
                                className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-medium bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
                                disabled={editingTeam !== null}
                              >
                                <Edit2 className="w-3 h-3" />
                                Panel
                              </button>
                              <button
                                onClick={() => handleIndividualAssign(team._id, 'slot')}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                disabled={editingTeam !== null}
                              >
                                <Calendar className="w-3 h-3" />
                                Slot
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
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Teams will appear here once added to the system'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PanelAssignment;
