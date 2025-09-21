import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Clock, 
  User, 
  Mail,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Settings,
  Database
} from 'lucide-react';
import { apiClient } from '../../utils/apiConfig';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const AdminLogs = () => {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [adminEmailFilter, setAdminEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Increased from 20 to 50
  const [totalLogs, setTotalLogs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [allLogs, setAllLogs] = useState([]); // Store all logs
  const [fetchingAll, setFetchingAll] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Status', color: 'gray' },
    { value: 'success', label: 'Success', color: 'green' },
    { value: 'error', label: 'Error', color: 'red' },
    { value: 'warning', label: 'Warning', color: 'yellow' },
    { value: 'info', label: 'Info', color: 'blue' }
  ];

  // Fetch logs with pagination only (no filters in API call)
  const fetchLogs = async (page = 1, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const params = {
        limit: itemsPerPage,
        skip: (page - 1) * itemsPerPage
        // Remove filters from API call - we'll filter client-side
      };

      const response = await apiClient.getAdminLogs(params);
      
      // Assuming the API returns an array of logs or an object with logs and total
      if (Array.isArray(response)) {
        setLogs(response);
        setTotalLogs(response.length);
      } else {
        setLogs(response.logs || response);
        setTotalLogs(response.total || response.logs?.length || response.length || 0);
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      toast.error('Failed to load admin logs');
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch ALL logs (without any filters)
  const fetchAllLogs = async () => {
    try {
      setFetchingAll(true);
      
      const params = {
        limit: 10000, // Large limit to get all logs
        skip: 0
        // No filters in API call - we'll filter client-side
      };

      const response = await apiClient.getAdminLogs(params);
      
      if (Array.isArray(response)) {
        setAllLogs(response);
        setLogs(response);
        setTotalLogs(response.length);
      } else {
        const logsData = response.logs || response;
        setAllLogs(logsData);
        setLogs(logsData);
        setTotalLogs(logsData.length);
      }
      
      toast.success(`Loaded ${Array.isArray(response) ? response.length : (response.logs || response).length} logs`);
    } catch (error) {
      console.error('Error fetching all admin logs:', error);
      toast.error('Failed to load all admin logs');
    } finally {
      setFetchingAll(false);
    }
  };

  // Initial load ONLY
  useEffect(() => {
    fetchLogs(1);
  }, []); // Remove dependencies to prevent reloading on filter changes

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, adminEmailFilter]);

  const handleRefresh = () => {
    // Reset filters and fetch fresh data
    setSearchTerm('');
    setStatusFilter('');
    setAdminEmailFilter('');
    fetchLogs(1, false);
  };

  const handlePageChange = (page) => {
    fetchLogs(page);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Handle MongoDB date format
      let date;
      if (dateString.$date) {
        date = new Date(dateString.$date);
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('login') || actionLower.includes('auth')) return <User className="w-4 h-4" />;
    if (actionLower.includes('post') || actionLower.includes('create') || actionLower.includes('add')) return <Settings className="w-4 h-4" />;
    if (actionLower.includes('put') || actionLower.includes('patch') || actionLower.includes('update') || actionLower.includes('edit')) return <Database className="w-4 h-4" />;
    if (actionLower.includes('delete') || actionLower.includes('remove')) return <XCircle className="w-4 h-4" />;
    if (actionLower.includes('get') || actionLower.includes('fetch')) return <Info className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  // Apply ALL filters client-side (no API calls)
  const filteredLogs = logs.filter(log => {
    // Search filter
    const matchesSearch = !searchTerm || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !statusFilter || log.status?.toLowerCase() === statusFilter.toLowerCase();

    // Admin email filter
    const matchesAdminEmail = !adminEmailFilter || 
      log.admin_email?.toLowerCase().includes(adminEmailFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesAdminEmail;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Get current page logs for display
  const getCurrentPageLogs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg font-medium">Loading admin logs...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Logs</h1>
            </div>
            <p className="text-gray-600">Monitor and track administrative actions across the system</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              onClick={fetchAllLogs}
              disabled={fetchingAll}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <Database className={`w-4 h-4 mr-2 ${fetchingAll ? 'animate-pulse' : ''}`} />
              {fetchingAll ? 'Loading All...' : 'Load All Logs'}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Logs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search actions, emails, endpoints, methods..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Admin Email Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={adminEmailFilter}
                      onChange={(e) => setAdminEmailFilter(e.target.value)}
                      placeholder="Filter by admin email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {getCurrentPageLogs().length} of {filteredLogs.length} logs 
                  {filteredLogs.length !== totalLogs && ` (filtered from ${totalLogs} total)`}
                  {(searchTerm || statusFilter || adminEmailFilter) && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Filters active
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setAdminEmailFilter('');
                    }}
                    disabled={!searchTerm && !statusFilter && !adminEmailFilter}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action & Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Admin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {getCurrentPageLogs().length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Activity className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                        <p className="text-gray-500">
                          {searchTerm || statusFilter || adminEmailFilter 
                            ? 'Try adjusting your filters to see more results.'
                            : 'No admin activity logs are available at the moment.'
                          }
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  getCurrentPageLogs().map((log, index) => (
                    <motion.tr
                      key={log._id?.$oid || log.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.action || 'Unknown Action'}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                                log.method === 'POST' ? 'bg-green-100 text-green-800' :
                                log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                log.method === 'PATCH' ? 'bg-orange-100 text-orange-800' :
                                log.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {log.method || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.admin_email?.split('@')[0] || 'Unknown Admin'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.admin_email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          <span className="ml-2">{log.status || 'Unknown'}</span>
                        </span>
                        {log.status_code && (
                          <div className="text-xs text-gray-500 mt-1">
                            Code: {log.status_code}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDateTime(log.created_at)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate">
                            {log.endpoint || 'No endpoint'}
                          </div>
                          {log.message && (
                            <div className="text-gray-600 text-xs mt-1 truncate">
                              {log.message}
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} ({filteredLogs.length} total logs)
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = Math.max(1, currentPage - 2) + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogs;
