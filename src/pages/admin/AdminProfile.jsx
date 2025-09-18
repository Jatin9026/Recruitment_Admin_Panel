import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Clock,
  Users,
  FileText,
  Award,
  Settings,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../utils/rolePermissions';
import { apiClient } from '../../utils/apiConfig';
import { toast } from 'sonner';

const AdminProfile = () => {
  const { user } = useAuthStore();
  const [resultStatus, setResultStatus] = useState(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch current result status
  useEffect(() => {
    const fetchResultStatus = async () => {
      try {
        const settings = await apiClient.getSettings();
        setResultStatus(settings.isResultOut);
      } catch (error) {
        console.error('Failed to fetch result status:', error);
        toast.error('Failed to load result status');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch result status for all admin roles
    if (user?.role) {
      fetchResultStatus();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Perform the actual toggle
  const doToggleResult = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const response = await apiClient.toggleResultStatus();
      setResultStatus(response.isResultOut);
      toast.success(
        response.isResultOut 
          ? 'Results have been published and are now visible to candidates!' 
          : 'Results have been hidden from candidates.'
      );
    } catch (error) {
      console.error('Failed to toggle result status:', error);
      toast.error('Failed to update result status. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  // Open modal when publishing, toggle directly when hiding
  const handleToggleResult = () => {
    if (isToggling) return;
    if (resultStatus === false) {
      setShowConfirm(true);
      return;
    }
    doToggleResult();
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return { name: 'Super Admin', color: 'bg-purple-500', icon: Shield };
      case ROLES.GD_PROCTOR:
        return { name: 'GD Proctor', color: 'bg-blue-500', icon: Users };
      case ROLES.INTERVIEWER:
        return { name: 'Interviewer', color: 'bg-green-500', icon: FileText };
      case ROLES.ADMIN:
        return { name: 'Admin', color: 'bg-orange-500', icon: Award };
      default:
        return { name: 'Admin', color: 'bg-gray-500', icon: User };
    }
  };

  const roleInfo = getRoleDisplay(user?.role || ROLES.SUPER_ADMIN);
  const RoleIcon = roleInfo.icon;

  // Calculate account age more accurately
  const getAccountAge = () => {
    if (!user?.created_at) return 'N/A';
    
    const createdDate = new Date(user.created_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const statsData = [
    {
      title: 'Account Status',
      value: user?.is_active ? 'Active' : 'Inactive',
      change: user?.is_active ? 'Online' : 'Offline',
      trend: user?.is_active ? 'up' : 'down',
      icon: Shield,
      color: user?.is_active ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Role Permissions',
      value: getRoleDisplay(user?.role).name,
      change: 'Current role',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Result Status',
      value: isLoading ? 'Loading...' : (resultStatus ? 'Published' : 'Hidden'),
      change: isLoading ? 'Fetching status' : (resultStatus ? 'Results are live' : 'Results are private'),
      trend: resultStatus ? 'up' : 'down',
      icon: resultStatus ? ToggleRight : ToggleLeft,
      color: resultStatus ? 'text-green-600' : 'text-gray-600'
    },
    {
      title: 'Account Age',
      value: getAccountAge(),
      change: 'Since creation',
      trend: 'up',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
        <p className="text-gray-600">Manage your profile information and view account statistics</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                  {(user?.name || 'Admin User').charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${roleInfo.color} rounded-full flex items-center justify-center`}>
                  <RoleIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{user?.name || 'Admin User'}</h2>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color} text-white mb-4`}>
                <RoleIcon className="w-4 h-4 mr-1" />
                {roleInfo.name}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-3" />
                <span>{user?.email || 'admin@recruitment.com'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-3" />
                <span>Joined {new Date(user?.created_at || '2024-01-15').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Shield className="w-4 h-4 mr-3" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-gray-500'
                        }`}>{stat.change}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Account Information</h3>
              <User className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Admin ID</label>
                <p className="text-gray-900 font-mono">{user?.id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color} text-white`}>
                  <RoleIcon className="w-4 h-4 mr-1" />
                  {roleInfo.name}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Since</label>
                <p className="text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Result Status Display - For All Roles */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Result Status</h4>
                  <p className="text-sm text-gray-600">
                    Current visibility status of recruitment results to candidates
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {isLoading ? (
                    <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  ) : (
                    <>
                      <span className={`text-sm font-medium ${
                        resultStatus ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {resultStatus ? 'Results Published' : 'Results Hidden'}
                      </span>
                      
                      {/* Toggle - Only for Super Admin */}
                      {user?.role === ROLES.SUPER_ADMIN ? (
                        <button
                          onClick={handleToggleResult}
                          disabled={isToggling}
                          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            resultStatus ? 'bg-green-600' : 'bg-gray-300'
                          } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              resultStatus ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        /* Read-only status indicator for other roles */
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          resultStatus 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {resultStatus ? (
                            <ToggleRight className="w-4 h-4 mr-1" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 mr-1" />
                          )}
                          {resultStatus ? 'Live' : 'Hidden'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Warning notice - Only for Super Admin */}
              {user?.role === ROLES.SUPER_ADMIN && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <Settings className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-medium text-yellow-800">Control Panel</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        You can toggle the result visibility. When enabled, all candidates will be able to view their recruitment results.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Info notice - For other roles */}
              {user?.role !== ROLES.SUPER_ADMIN && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-medium text-blue-800">Information</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        {resultStatus 
                          ? 'Results are currently published and visible to all candidates.'
                          : 'Results are currently hidden from candidates and will be published by the Super Admin when ready.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isToggling && setShowConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900">Publish Results?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will make the results visible to all candidates. Do you want to continue?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isToggling}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirm(false);
                  await doToggleResult();
                }}
                disabled={isToggling}
                className={`px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 flex items-center gap-2 disabled:opacity-50`}
              >
                {isToggling ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;