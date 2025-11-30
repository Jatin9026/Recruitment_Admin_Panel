import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCog,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle,
  Clock,
  DollarSign,
  CreditCard,
  IndianRupeeIcon,
} from 'lucide-react';
import { ideatexApiClient } from '../../utils/ideatexApiConfig';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalCoordinators: 0,
    assignedPanels: 0,
    pendingAssignments: 0,
    completedPayments: 0,
    totalMoneyCollected: 0,
  });
  const [recentTeams, setRecentTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch teams and coordinators
      const [teamsRes, coordinatorsRes] = await Promise.all([
        ideatexApiClient.getAllTeams(),
        ideatexApiClient.getAllCoordinators(),
      ]);

      // Calculate stats
      const teams = teamsRes.data?.teams || teamsRes.teams || [];
      const coordinators = coordinatorsRes.data?.coordinators || coordinatorsRes.coordinators || [];
      
      const assignedPanels = teams.filter((t) => t.panel).length;
      const pendingAssignments = teams.length - assignedPanels;
      
      // Calculate payment statistics
      const completedPayments = teams.filter((t) => t.paymentStatus === 'completed').length;
      const totalMoneyCollected = teams.reduce((sum, team) => {
        if (team.paymentStatus === 'completed' && team.paymentDetails?.amount) {
          return sum + team.paymentDetails.amount;
        }
        return sum;
      }, 0);

      setStats({
        totalTeams: teams.length,
        totalCoordinators: coordinators.length,
        assignedPanels,
        pendingAssignments,
        completedPayments,
        totalMoneyCollected,
      });

      // Get recent teams (last 5) and process to add leader info
      const processedTeams = teams.map(team => {
        // Find leader from members array or use leaderId
        const leader = team.leaderId || team.members?.find(m => m.role === 'LEADER');
        const leaderName = team.leaderId?.name || leader?.userId?.name || 'N/A';
        
        return {
          ...team,
          leaderName
        };
      });
      
      setRecentTeams(processedTeams.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Money Collected',
      value: `₹${(stats.totalMoneyCollected / 100).toLocaleString('en-IN')}`,
      icon: IndianRupeeIcon,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      isMonetary: true,
    },
    {
      title: 'Completed Payments',
      value: stats.completedPayments,
      icon: CreditCard,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-100',
    },
    {
      title: 'Total Teams',
      value: stats.totalTeams,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Total Coordinators',
      value: stats.totalCoordinators,
      icon: UserCog,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Assigned Panels',
      value: stats.assignedPanels,
      icon: CheckCircle,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Pending Assignments',
      value: stats.pendingAssignments,
      icon: AlertCircle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-600" />
              Ideatex Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Event management and team overview
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="font-medium text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <h3 className={`text-3xl font-bold text-gray-900 mb-1 ${stat.isMonetary ? 'text-2xl' : ''}`}>
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Teams */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Teams</h2>
          <p className="text-sm text-gray-500 mt-1">Latest registered teams</p>
        </div>
        <div className="p-6">
          {recentTeams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Panel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTeams.map((team, index) => (
                    <tr
                      key={team._id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
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
                        <div className="text-sm text-gray-900">{team.leaderName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.panel ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {team.panel}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.slot ? (
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
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.paymentStatus === 'completed' ? (
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
                Teams will appear here once added to the system
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
