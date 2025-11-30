import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff, 
  Key, 
  Database,
  Server,
  Mail,
  CreditCard,
  HardDrive,
  Shield,
  Package,
  RefreshCw,
  Lock,
  Unlock,
  X,
  Filter
} from 'lucide-react';
import { ideatexApiClient } from '../../utils/ideatexApiConfig';

const CATEGORIES = [
  { value: 'all', label: 'All Settings', icon: Package },
  { value: 'database', label: 'Database', icon: Database },
  { value: 'server', label: 'Server', icon: Server },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'payment', label: 'Payment', icon: CreditCard },
  { value: 'storage', label: 'Storage', icon: HardDrive },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'general', label: 'General', icon: SettingsIcon },
];

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [filteredSettings, setFilteredSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    encrypted: false,
    description: '',
    category: 'general',
  });
  const [revealedValues, setRevealedValues] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    filterSettings();
  }, [searchQuery, selectedCategory, settings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await ideatexApiClient.getAllSettings();
      const settingsData = response.data?.settings || [];
      setSettings(settingsData);
      setFilteredSettings(settingsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterSettings = () => {
    let filtered = settings;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(s =>
        s.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSettings(filtered);
  };

  const handleCreateSetting = async (e) => {
    e.preventDefault();
    try {
      await ideatexApiClient.createSetting(formData);
      showToast('Setting created successfully!');
      setShowCreateModal(false);
      setFormData({ key: '', value: '', encrypted: false, description: '', category: 'general' });
      fetchSettings();
    } catch (error) {
      console.error('Error creating setting:', error);
      showToast(error.message || 'Failed to create setting', 'error');
    }
  };

  const handleUpdateSetting = async (e) => {
    e.preventDefault();
    try {
      await ideatexApiClient.updateSetting(currentSetting.key, { value: formData.value });
      showToast('Setting updated successfully!');
      setShowEditModal(false);
      setCurrentSetting(null);
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      showToast(error.message || 'Failed to update setting', 'error');
    }
  };

  const handleDeleteSetting = async (key) => {
    if (!window.confirm(`Are you sure you want to delete setting "${key}"?`)) return;
    
    try {
      await ideatexApiClient.deleteSetting(key);
      showToast('Setting deleted successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error deleting setting:', error);
      showToast('Failed to delete setting', 'error');
    }
  };

  const handleReloadSettings = async () => {
    try {
      await ideatexApiClient.reloadSettings();
      showToast('Settings reloaded successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error reloading settings:', error);
      showToast('Failed to reload settings', 'error');
    }
  };

  const handleViewSetting = async (setting) => {
    try {
      const response = await ideatexApiClient.getSetting(setting.key);
      setCurrentSetting({ ...setting, value: response.data?.value });
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching setting value:', error);
      showToast('Failed to load setting value', 'error');
    }
  };

  const openEditModal = async (setting) => {
    try {
      const response = await ideatexApiClient.getSetting(setting.key);
      setCurrentSetting({ ...setting, value: response.data?.value });
      setFormData({ value: response.data?.value });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching setting value:', error);
      showToast('Failed to load setting value', 'error');
    }
  };

  const toggleRevealValue = (key) => {
    setRevealedValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : Package;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 bg-white rounded-lg shadow-xl border-l-4 px-6 py-4 max-w-md"
            style={{
              borderLeftColor: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#10b981'
            }}
          >
            <p className="font-medium text-gray-900">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-indigo-600" />
              Application Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage encrypted configuration settings
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReloadSettings}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Cache
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Setting
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Settings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Encrypted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredSettings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No settings found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery || selectedCategory !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Create your first setting to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSettings.map((setting) => {
                  const CategoryIcon = getCategoryIcon(setting.category);
                  return (
                    <motion.tr
                      key={setting.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {setting.key}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-gray-700 capitalize">
                            {setting.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 line-clamp-1">
                          {setting.description || 'No description'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {setting.encrypted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Lock className="w-3 h-3" />
                            Encrypted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <Unlock className="w-3 h-3" />
                            Plain
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          <div>{formatDate(setting.updatedAt)}</div>
                          {setting.updatedBy && (
                            <div className="text-xs text-gray-400">by {setting.updatedBy}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewSetting(setting)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(setting)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSetting(setting.key)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Setting Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-indigo-600" />
                  Create New Setting
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleCreateSetting} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., database.host"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <textarea
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Setting value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief description"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="encrypted"
                    checked={formData.encrypted}
                    onChange={(e) => setFormData({ ...formData, encrypted: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="encrypted" className="text-sm font-medium text-gray-700 flex items-center gap-1 cursor-pointer">
                    <Lock className="w-4 h-4 text-amber-600" />
                    Encrypt this value
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Setting Modal */}
      <AnimatePresence>
        {showEditModal && currentSetting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-indigo-600" />
                  Edit Setting
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleUpdateSetting} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key (Read-only)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentSetting.key}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      value={ currentSetting.encrypted ? '' : formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12"
                      rows="3"
                    />
                    {/* <button
                      type="button"
                      onClick={() => toggleRevealValue(currentSetting.key)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {revealedValues[currentSetting.key] ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button> */}
                  </div>
                  {currentSetting.encrypted && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 bg-amber-50 px-3 py-2 rounded">
                      <Lock className="w-3 h-3" />
                      This value is encrypted
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Setting Modal */}
      <AnimatePresence>
        {showViewModal && currentSetting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-600" />
                  View Setting
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg font-mono text-sm text-gray-900 border border-gray-200">
                    {currentSetting.key}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <div className="relative">
                    <div className={`px-4 py-3 bg-gray-50 rounded-lg text-sm border border-gray-200 break-all min-h-[60px] ${!revealedValues[currentSetting.key] && currentSetting.encrypted ? 'filter blur-sm select-none' : 'text-gray-900'}`}>
                      {currentSetting.encrypted ? currentSetting.value.slice(0, 45) + '...' : currentSetting.value || 'N/A'}
                    </div>
                    {/* {currentSetting.encrypted && (
                      <button
                        onClick={() => toggleRevealValue(currentSetting.key)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded"
                      >
                        {revealedValues[currentSetting.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )} */}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200 capitalize">
                      {currentSetting.category}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
                    {currentSetting.encrypted ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <Lock className="w-3 h-3" />
                        Encrypted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        <Unlock className="w-3 h-3" />
                        Plain
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200">
                    {currentSetting.description || 'No description'}
                  </div>
                </div>

                {currentSetting.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200">
                      {formatDate(currentSetting.updatedAt)}
                      {currentSetting.updatedBy && ` by ${currentSetting.updatedBy}`}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mt-4"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
