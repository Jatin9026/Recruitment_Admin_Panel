import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
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
  Shield,
  Settings,
  Database,
  Trash2,
  UserPlus,
  Eye
} from 'lucide-react';
import { apiClient } from '../../utils/apiConfig';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const AdminList = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const roleOptions = [
    { value: '', label: 'All Roles', color: 'gray' },
    { value: 'SuperAdmin', label: 'Super Admin', color: 'red' },
    { value: 'GDProctor', label: 'GD Proctor', color: 'blue' },
    { value: 'Interviewer', label: 'Interviewer', color: 'green' },
    { value: 'Admin', label: 'Admin', color: 'purple' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status', color: 'gray' },
    { value: 'true', label: 'Active', color: 'green' },
    { value: 'false', label: 'Inactive', color: 'red' }
  ];

  // Fetch all admins
  const fetchAdmins = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const response = await apiClient.request('/api/admin/all');
      
      // Assuming the API returns an array of admins
      if (Array.isArray(response)) {
        setAdmins(response);
        setTotalAdmins(response.length);
      } else {
        setAdmins(response.admins || []);
        setTotalAdmins(response.total || response.admins?.length || 0);
      }
      
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin list');
      setAdmins([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const handleRefresh = () => {
    // Reset filters and fetch fresh data
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    fetchAdmins(false);
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!adminId) {
      toast.error('Invalid admin ID');
      return;
    }

    try {
      setDeletingAdmin(adminId);
      
      await apiClient.request(`/api/admin/delete/${adminId}`, {
        method: 'DELETE'
      });
      
      // Remove admin from local state
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
      setTotalAdmins(prev => prev - 1);
      
      setConfirmDelete(null);
      toast.success(`Admin ${adminName} has been deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(`Failed to delete admin: ${error.message}`);
    } finally {
      setDeletingAdmin(null);
    }
  };

  const openDeleteConfirmation = (admin) => {
    setConfirmDelete(admin);
  };

  const closeDeleteConfirmation = () => {
    setConfirmDelete(null);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'GDProctor':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'Interviewer':
        return <User className="w-4 h-4 text-green-600" />;
      case 'Admin':
        return <Settings className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'GDProctor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Interviewer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Apply filters client-side
  const filteredAdmins = admins.filter(admin => {
    // Search filter
    const matchesSearch = !searchTerm || 
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role?.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = !roleFilter || admin.role === roleFilter;

    // Status filter
    const matchesStatus = !statusFilter || admin.is_active.toString() === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  // Get current page admins for display
  const getCurrentPageAdmins = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAdmins.slice(startIndex, endIndex);
  };

  const canDeleteAdmin = (admin) => {
    // Super Admin can delete anyone except themselves
    // Other roles cannot delete anyone
    return user?.role === 'SuperAdmin' && admin.id !== user?.id;
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
          <p className="text-gray-600 text-lg font-medium">Loading administrators...</p>
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
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Administrator Management</h1>
            </div>
            <p className="text-gray-600">Manage system administrators and their permissions</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/create')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Admin
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
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

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-3xl font-bold text-gray-900">{totalAdmins}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {admins.filter(a => a.is_active).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-red-600">
                {admins.filter(a => !a.is_active).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-3xl font-bold text-purple-600">
                {admins.filter(a => a.role === 'SuperAdmin').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Administrators</h3>
              
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
                      placeholder="Search by name, email, or role..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {getCurrentPageAdmins().length} of {filteredAdmins.length} admins 
                  {filteredAdmins.length !== totalAdmins && ` (filtered from ${totalAdmins} total)`}
                  {(searchTerm || roleFilter || statusFilter) && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Filters active
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('');
                    setStatusFilter('');
                  }}
                  disabled={!searchTerm && !roleFilter && !statusFilter}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admins Table */}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Administrator</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageAdmins().length === 0 ? (
                <motion.tr
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No administrators found</h3>
                      <p className="text-gray-500">
                        {searchTerm || roleFilter || statusFilter 
                          ? 'Try adjusting your filters to see more results.'
                          : 'No administrators are available at the moment.'
                        }
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                getCurrentPageAdmins().map((admin, index) => (
                  <motion.tr
                    key={admin.id || index}
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {admin.name}
                            {admin.id === user?.id && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(admin.role)}`}>
                        {getRoleIcon(admin.role)}
                        <span className="ml-2">{admin.role}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        admin.is_active
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {admin.is_active ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDateTime(admin.created_at)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {canDeleteAdmin(admin) && (
                          <button
                            onClick={() => openDeleteConfirmation(admin)}
                            disabled={deletingAdmin === admin.id}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingAdmin === admin.id ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full mr-1"
                                />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </>
                            )}
                          </button>
                        )}
                        
                        {!canDeleteAdmin(admin) && admin.id === user?.id && (
                          <span className="text-sm text-gray-500 italic">Current User</span>
                        )}
                        
                        {!canDeleteAdmin(admin) && admin.id !== user?.id && (
                          <span className="text-sm text-gray-500 italic">Protected</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} ({filteredAdmins.length} total admins)
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Administrator</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{confirmDelete.name}</strong> ({confirmDelete.email})?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This will permanently remove their access to the system.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteConfirmation}
                  disabled={deletingAdmin === confirmDelete.id}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAdmin(confirmDelete.id, confirmDelete.name)}
                  disabled={deletingAdmin === confirmDelete.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
                >
                  {deletingAdmin === confirmDelete.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Admin
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminList;
