import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Eye, X, User, Mail, Phone, BookOpen, Building2, IdCard, Calendar, CheckCircle, XCircle, CreditCard, Clock } from 'lucide-react';
import { ideatexApiClient } from '../../utils/ideatexApiConfig';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    fetchTeams();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = teams.filter(
        (team) =>
          team.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.teamCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams(teams);
    }
  }, [searchQuery, teams]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching teams from API...');
      const response = await ideatexApiClient.getAllTeams();
      console.log('Teams API response:', response);
      
      // Extract teams array from response (already grouped by backend)
      const teamsData = response.data?.teams || response.teams || [];
      console.log('Extracted teams data:', teamsData);
      
      if (Array.isArray(teamsData)) {
        // Teams are already grouped by backend, just add leader reference
        const processedTeams = teamsData.map(team => ({
          ...team,
          leader: team.members?.find(m => m.role === 'LEADER') || null,
          isRegistered: team.isRegisterd || false
        }));
        
        console.log('Processed teams:', processedTeams);
        
        setTeams(processedTeams);
        setFilteredTeams(processedTeams);
      } else {
        console.error('Teams data is not an array:', teamsData);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError(error.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const openTeamModal = (team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  // Helper function to format slot time with date and time
  const formatSlotDateTime = (slot) => {
    if (!slot) return { display: 'Not Assigned', date: null, time: null };
    
    // If slot is an ISO date string or timestamp
    const date = new Date(slot);
    if (!isNaN(date.getTime())) {
      return {
        display: date.toLocaleString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        date: date.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    }
    
    // If slot is a number (slot number), map to time ranges
    const slotNumber = parseInt(slot);
    if (!isNaN(slotNumber)) {
      const slotTimes = {
        1: { time: '9:00 AM - 9:30 AM', period: 'Morning' },
        2: { time: '9:30 AM - 10:00 AM', period: 'Morning' },
        3: { time: '10:00 AM - 10:30 AM', period: 'Morning' },
        4: { time: '10:30 AM - 11:00 AM', period: 'Morning' },
        5: { time: '11:00 AM - 11:30 AM', period: 'Morning' },
        6: { time: '11:30 AM - 12:00 PM', period: 'Morning' },
        7: { time: '12:00 PM - 12:30 PM', period: 'Afternoon' },
        8: { time: '12:30 PM - 1:00 PM', period: 'Afternoon' },
        9: { time: '1:00 PM - 1:30 PM', period: 'Afternoon' },
        10: { time: '1:30 PM - 2:00 PM', period: 'Afternoon' },
        11: { time: '2:00 PM - 2:30 PM', period: 'Afternoon' },
        12: { time: '2:30 PM - 3:00 PM', period: 'Afternoon' },
        13: { time: '3:00 PM - 3:30 PM', period: 'Afternoon' },
        14: { time: '3:30 PM - 4:00 PM', period: 'Evening' },
        15: { time: '4:00 PM - 4:30 PM', period: 'Evening' },
        16: { time: '4:30 PM - 5:00 PM', period: 'Evening' },
      };
      const slotInfo = slotTimes[slotNumber];
      return {
        display: slotInfo ? `Slot ${slotNumber} - ${slotInfo.time}` : `Slot ${slotNumber}`,
        date: null,
        time: slotInfo?.time || null,
        slotNumber: slotNumber,
        period: slotInfo?.period || null
      };
    }
    
    // If slot is already a formatted string
    if (typeof slot === 'string') {
      return { display: slot, date: null, time: null };
    }
    
    return { display: 'Not Assigned', date: null, time: null };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Teams</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTeams}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Teams
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all registered teams
          </p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by team name or team code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Teams Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Teams ({filteredTeams.length})
          </h2>
        </div>
        <div className="p-6">
          {filteredTeams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Panel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">{filteredTeams.map((team) => (
                    <tr
                      key={team._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{team.panel ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {team.panel}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.attendance?.isPresent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Absent
                          </span>
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
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openTeamModal(team)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
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

      {/* Team Details Modal */}
      {isModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.teamName}</h2>
                <p className="text-sm text-gray-500 mt-1">Team Code: {selectedTeam.teamCode}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Team Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Panel Assignment</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedTeam.panel || 'Not Assigned'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Slot
                    </p>
                    {(() => {
                      const slotInfo = formatSlotDateTime(selectedTeam.slot);
                      return (
                        <div>
                          {slotInfo.time ? (
                            <>
                              <p className="text-sm font-semibold text-indigo-700">
                                {slotInfo.time}
                              </p>
                              {slotInfo.slotNumber && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Slot #{slotInfo.slotNumber} • {slotInfo.period}
                                </p>
                              )}
                              {slotInfo.date && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {slotInfo.date}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">
                              {slotInfo.display}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Verification Status</p>
                    <div className="flex items-center gap-1">
                      {selectedTeam.isVerified ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-700">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Registration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedTeam.isRegistered ? 'Registered' : 'Not Registered'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Attendance</p>
                    <div className="flex items-center gap-1">
                      {selectedTeam.attendance?.isPresent ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">Present</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-semibold text-red-700">Absent</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Members</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedTeam.members.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                    <div className="flex items-center gap-1">
                      {selectedTeam.paymentStatus === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">Completed</span>
                        </>
                      ) : selectedTeam.paymentStatus === 'pending' ? (
                        <>
                          <XCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-700">Pending</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-gray-700">
                          {selectedTeam.paymentStatus || 'Unknown'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                {selectedTeam.paymentDetails && (
                  <div className="mt-4 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-700 font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        Razorpay Payment Details
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
                        {selectedTeam.paymentDetails.status?.toUpperCase() || 'COMPLETED'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Payment ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all font-semibold">
                          {selectedTeam.paymentDetails.razorpayPaymentId}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Order ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all font-semibold">
                          {selectedTeam.paymentDetails.razorpayOrderId}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Amount Paid</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{(selectedTeam.paymentDetails.amount / 100).toFixed(2)}
                          <span className="text-xs text-gray-500 ml-1">{selectedTeam.paymentDetails.currency}</span>
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Payment Date</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {new Date(selectedTeam.paymentDetails.paidAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legacy Payment Information (Backward Compatibility) */}
                {!selectedTeam.paymentDetails && (selectedTeam.razorpayPaymentId || selectedTeam.razorpayOrderId || selectedTeam.paymentTransactionId) && (
                  <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-xs text-gray-600 mb-3 font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-yellow-600" />
                      Legacy Payment Information
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTeam.razorpayPaymentId && (
                        <div className="bg-white p-3 rounded border border-yellow-100">
                          <p className="text-xs text-gray-500 mb-1">Razorpay Payment ID</p>
                          <p className="text-sm font-mono text-gray-900 break-all">
                            {selectedTeam.razorpayPaymentId}
                          </p>
                        </div>
                      )}
                      {selectedTeam.razorpayOrderId && (
                        <div className="bg-white p-3 rounded border border-yellow-100">
                          <p className="text-xs text-gray-500 mb-1">Razorpay Order ID</p>
                          <p className="text-sm font-mono text-gray-900 break-all">
                            {selectedTeam.razorpayOrderId}
                          </p>
                        </div>
                      )}
                      {selectedTeam.paymentTransactionId && (
                        <div className="bg-white p-3 rounded border border-yellow-100">
                          <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                          <p className="text-sm font-mono text-gray-900 break-all">
                            {selectedTeam.paymentTransactionId}
                          </p>
                        </div>
                      )}
                      {selectedTeam.isPendingPayment !== undefined && (
                        <div className="bg-white p-3 rounded border border-yellow-100">
                          <p className="text-xs text-gray-500 mb-1">Payment Pending</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedTeam.isPendingPayment ? 'Yes' : 'No'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* QR Code and Payment Screenshot (Backward Compatibility) */}
                {(selectedTeam.qrUrl || selectedTeam.paymentScreenshot) && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-3 font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-600" />
                      Legacy Payment Records (Backward Compatibility)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTeam.qrUrl && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Team QR Code</p>
                          <img 
                            src={selectedTeam.qrUrl} 
                            alt="Team QR Code" 
                            className="w-48 h-48 object-contain border border-gray-300 rounded mx-auto cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(selectedTeam.qrUrl, '_blank')}
                          />
                        </div>
                      )}
                      {selectedTeam.paymentScreenshot && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Payment Screenshot</p>
                          <img 
                            src={selectedTeam.paymentScreenshot} 
                            alt="Payment Screenshot" 
                            className="w-48 h-48 object-contain border border-gray-300 rounded mx-auto cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(selectedTeam.paymentScreenshot, '_blank')}
                          />
                          <p className="text-xs text-gray-400 mt-2 text-center">Click to view full size</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Leader Information */}
                {selectedTeam.leaderId && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">Team Leader Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{selectedTeam.leaderId.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedTeam.leaderId.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedTeam.leaderId.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span>{selectedTeam.leaderId.college}</span>
                      </div>
                      {selectedTeam.leaderId.attendance && (
                        <div className="flex items-center gap-2">
                          {selectedTeam.leaderId.attendance.isPresent ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-medium">Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-red-700 font-medium">Absent</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members ({selectedTeam.members.length})</h3>
                <div className="space-y-4">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member._id}
                      className={`border rounded-lg p-4 ${
                        member.role === 'LEADER' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            member.role === 'LEADER' 
                              ? 'bg-blue-600' 
                              : 'bg-gray-400'
                          }`}>
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{member.userId?.name || 'N/A'}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.role === 'LEADER'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.userId?.attendance?.isPresent ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Absent
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{member.userId?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{member.userId?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{member.userId?.college || 'N/A'}</span>
                        </div>
                        {member.userId?.attendance?.markedAt && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs">
                              {new Date(member.userId.attendance.markedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamList;
