import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, FileText, Users, Plus, Minus, Send, Eye, EyeOff, RefreshCw, BarChart3, TrendingUp, Edit, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiClient } from "../../utils/apiConfig";

const MailTemplate = () => {
  const location = useLocation();
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({ subject: "", body: "", custom: [] });
  const [loading, setLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [customField, setCustomField] = useState("");
  const [showStats, setShowStats] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState({ show: false, template: null });
  const [stats, setStats] = useState({
    total: 0,
    withCustomFields: 0,
    readyToUse: 0
  });

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEmailTemplates();
      setTemplates(response || []);
      
      // Calculate stats
      const total = response?.length || 0;
      const withCustomFields = response?.filter(t => t.custom && t.custom.length > 0).length || 0;
      const readyToUse = response?.filter(t => t.subject && t.body).length || 0;
      setStats({ total, withCustomFields, readyToUse });
      
      toast.success(`Loaded ${total} templates`, { duration: 3000 });
      
      // Ensure scroll to top after data is loaded
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    } catch (err) {
      console.error('Error fetching templates:', err);
      toast.error("Error fetching templates");
      setTemplates([]);
      setStats({ total: 0, withCustomFields: 0, readyToUse: 0 });
      
      // Ensure scroll to top even on error
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCustomFieldAdd = () => {
    if (customField.trim() && !form.custom.includes(customField.trim())) {
      setForm({
        ...form,
        custom: [...form.custom, customField.trim()]
      });
      setCustomField("");
    }
  };

  const handleCustomFieldRemove = (fieldToRemove) => {
    setForm({
      ...form,
      custom: form.custom.filter(field => field !== fieldToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingTemplate(true);
    
    try {
      const templateData = {
        subject: form.subject,
        body: form.body,
        custom: form.custom
      };

      if (editingTemplate) {
        // For editing, we would need an update endpoint
        toast.error("Update functionality not yet implemented in API");
      } else {
        const response = await apiClient.saveEmailTemplate(templateData);
        setTemplates([...templates, response]);
        toast.success("Template created successfully", { duration: 5000 });
        
        // Update stats
        const newTotal = templates.length + 1;
        const newWithCustomFields = templates.filter(t => t.custom && t.custom.length > 0).length + 
          (response.custom && response.custom.length > 0 ? 1 : 0);
        const newReadyToUse = templates.filter(t => t.subject && t.body).length + 
          (response.subject && response.body ? 1 : 0);
        setStats({ total: newTotal, withCustomFields: newWithCustomFields, readyToUse: newReadyToUse });
      }
      
      setForm({ subject: "", body: "", custom: [] });
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.message || "Error saving template");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setForm({
      subject: template.subject || "",
      body: template.body || "",
      custom: template.custom || []
    });
  };

  const handlePreview = (template) => {
    setPreviewModal({ show: true, template });
  };

  const closePreviewModal = () => {
    setPreviewModal({ show: false, template: null });
  };

  const generatePreviewContent = (template) => {
    if (!template) return { subject: "", body: "" };
    
    // Sample data for preview
    const sampleData = {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      domain: "Technical",
      branch: "Computer Science",
      year: "3rd Year",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      venue: "Room 101"
    };

    let subject = template.subject || "";
    let body = template.body || "";

    // Replace common variables
    Object.keys(sampleData).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      subject = subject.replace(regex, sampleData[key]);
      body = body.replace(regex, sampleData[key]);
    });

    // Replace custom variables with sample values
    if (template.custom && template.custom.length > 0) {
      template.custom.forEach(customField => {
        const regex = new RegExp(`{{\\s*${customField}\\s*}}`, 'gi');
        subject = subject.replace(regex, `[${customField}]`);
        body = body.replace(regex, `[${customField}]`);
      });
    }

    return { subject, body };
  };

  const handleRefresh = () => {
    fetchTemplates();
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50 px-6 py-4"
    >
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                <p className="text-gray-600">Create and manage email templates with custom variables</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowStats(!showStats)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>{showStats ? 'Hide' : 'Show'} Stats</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Templates</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>All Templates</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">With Custom Fields</p>
                    <p className="text-3xl font-bold text-green-600">{stats.withCustomFields}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Custom Variables</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ready to Use</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.readyToUse}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Send className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-purple-600">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>Complete Templates</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-2xl font-bold text-orange-600">{loading ? 'Loading' : 'Ready'}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <RefreshCw className={`w-6 h-6 text-orange-600 ${loading ? 'animate-spin' : ''}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-orange-600">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span>{loading ? 'Loading...' : 'System Ready'}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template Form */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="font-semibold text-lg mb-6 flex items-center">
            {editingTemplate ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
            {editingTemplate ? "Edit Template" : "Create New Template"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block font-medium mb-2" htmlFor="subject">
                  Email Subject *
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Enter email subject..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block font-medium mb-2">
                  Custom Variables ({form.custom.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customField}
                    onChange={(e) => setCustomField(e.target.value)}
                    placeholder="Add custom variable..."
                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomFieldAdd())}
                  />
                  <motion.button
                    type="button"
                    onClick={handleCustomFieldAdd}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                
                {form.custom.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AnimatePresence>
                      {form.custom.map((field, index) => (
                        <motion.span
                          key={field}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {field}
                          <motion.button
                            type="button"
                            onClick={() => handleCustomFieldRemove(field)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            ×
                          </motion.button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Variables can be used in templates as: name, email, phone, etc.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block font-medium mb-2" htmlFor="body">
                Email Body (HTML) *
              </label>
              <textarea
                id="body"
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={8}
                placeholder="Enter HTML email body... Use variables like {{name}}, {{email}}, etc."
                className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Use double curly braces for variables: {"{{"} variable_name {"}}"} 
              </p>
            </motion.div>

            {/* Preview Section */}
            <AnimatePresence>
              {form.body && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </motion.button>
                  
                  <AnimatePresence>
                    {showPreview && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                      >
                        <h4 className="font-medium mb-2">Subject Preview:</h4>
                        <p className="mb-4 p-2 bg-white rounded border">{form.subject}</p>
                        <h4 className="font-medium mb-2">Body Preview:</h4>
                        <div 
                          className="p-4 bg-white rounded border min-h-[200px]"
                          dangerouslySetInnerHTML={{ __html: form.body }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <motion.button
                type="submit"
                disabled={savingTemplate}
                whileHover={{ scale: savingTemplate ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingTemplate ? (
                  <>
                    <RefreshCw className="animate-spin w-4 h-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingTemplate ? "Update Template" : "Create Template"}
                  </>
                )}
              </motion.button>
              
              {editingTemplate && (
                <motion.button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(null);
                    setForm({ subject: "", body: "", custom: [] });
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Templates List */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Existing Templates
            </h2>
            <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
              {templates.length} templates found
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
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
                <p className="text-gray-600 text-lg font-medium">Loading templates...</p>
              </motion.div>
            </div>
          ) : templates.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Templates Found</h3>
              <p className="text-gray-500">Create your first template using the form above</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <Mail className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">{template.subject}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.body}</p>
                            
                            {template.custom && template.custom.length > 0 && (
                              <div className="mb-4">
                                <p className="text-xs font-medium text-gray-500 mb-2">Custom Variables:</p>
                                <div className="flex flex-wrap gap-2">
                                  {template.custom.slice(0, 5).map((field) => (
                                    <span 
                                      key={field}
                                      className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                                    >
                                      {field}
                                    </span>
                                  ))}
                                  {template.custom.length > 5 && (
                                    <span className="text-xs text-gray-500 py-1">
                                      +{template.custom.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {template.created_at && (
                              <p className="text-xs text-gray-400">
                                Created: {new Date(template.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <motion.button
                          onClick={() => handleEdit(template)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handlePreview(template)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={closePreviewModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Email Template Preview</h3>
                      <p className="text-gray-600 text-sm">How this template will appear in emails</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={closePreviewModal}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {previewModal.template && (
                    <div className="space-y-6">
                      {/* Email Interface Mockup */}
                      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          {/* Email Header */}
                          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-semibold">Recruitment Portal</p>
                                <p className="text-blue-100 text-sm">noreply@recruitmentportal.com</p>
                              </div>
                            </div>
                          </div>

                          {/* Email Subject */}
                          <div className="bg-gray-50 border-b border-gray-200 p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600">Subject:</p>
                                <p className="font-semibold text-gray-900 text-lg">
                                  {generatePreviewContent(previewModal.template).subject}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Email Body */}
                          <div className="p-6">
                            <div 
                              className="prose prose-gray max-w-none"
                              dangerouslySetInnerHTML={{ 
                                __html: generatePreviewContent(previewModal.template).body 
                              }}
                            />
                          </div>

                          {/* Email Footer */}
                          <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
                            <p className="text-xs text-gray-500">
                              This email was sent from the Recruitment Portal System
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              © 2025 Recruitment Portal. All rights reserved.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Template Information */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Template Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-blue-700 font-medium">Subject:</p>
                            <p className="text-blue-800">{previewModal.template.subject}</p>
                          </div>
                          <div>
                            <p className="text-blue-700 font-medium">Created:</p>
                            <p className="text-blue-800">
                              {previewModal.template.created_at 
                                ? new Date(previewModal.template.created_at).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                          {previewModal.template.custom && previewModal.template.custom.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-blue-700 font-medium mb-2">Custom Variables:</p>
                              <div className="flex flex-wrap gap-2">
                                {previewModal.template.custom.map((field, index) => (
                                  <span 
                                    key={index}
                                    className="inline-block px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium"
                                  >
                                    {"{{"}{field}{"}}"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sample Data Notice */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Preview Note
                        </h4>
                        <p className="text-amber-800 text-sm">
                          This preview uses sample data to demonstrate how the template will look. 
                          Actual emails will contain real recipient data and custom variable values.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                  <motion.button
                    onClick={() => {
                      handleEdit(previewModal.template);
                      closePreviewModal();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Template
                  </motion.button>
                  <motion.button
                    onClick={closePreviewModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MailTemplate;
