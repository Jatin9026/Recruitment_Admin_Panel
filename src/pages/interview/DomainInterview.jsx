import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter,
  Eye,
  GraduationCap,
  Building,
  Mail,
  Phone,
  Award,
  RefreshCw,
  TrendingUp,
  BarChart3,
  UserCheck,
  Target,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare,
  Save,
  X
} from "lucide-react";
import { apiClient } from "../../utils/apiConfig";
import toast, { Toaster } from "react-hot-toast";

const DomainInterviewBase = ({ domain }) => {
  const location = useLocation();
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluatingApplicant, setEvaluatingApplicant] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [showStats, setShowStats] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const departments = [...new Set(applicants.map(a => a.branch).filter(Boolean))];
  const years = [...new Set(applicants.map(a => a.year).filter(Boolean))].sort();

  // Function to refresh only the applicants data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.success("Refreshing applicants data...");
      await fetchDomainApplicants();
      toast.success("Applicants data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing applicants:", error);
      toast.error("Failed to refresh applicants data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const fetchDomainApplicants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      // console.log("All applicants:", response);
      
      // Filter for applicants who have been selected from both GD and Screening rounds
      // and have the current domain in their domains array
      const filtered = response.filter(applicant => {
        const hasGDSelected = applicant.gd && applicant.gd.status === "selected";
        const hasScreeningSelected = applicant.screening && applicant.screening.status === "selected";
        const hasDomain = applicant.domains && applicant.domains.includes(domain);
        
        // console.log(`${applicant.name}: GD=${hasGDSelected}, Screening=${hasScreeningSelected}, Domain=${hasDomain}, Domains=${applicant.domains}`);
        
        return hasGDSelected && hasScreeningSelected && hasDomain;
      });
      
      // console.log(`Filtered applicants for ${domain}:`, filtered);
      setApplicants(filtered);
    } catch (error) {
      console.error("Error fetching domain applicants:", error);
      toast.error("Failed to load applicants");
      setApplicants([]);
    } finally {
      setLoading(false);
      
      // Ensure scroll to top after data is loaded
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  };

  useEffect(() => {
    fetchDomainApplicants();
  }, [domain]);

  // Filter applicants based on search and filters
  useEffect(() => {
    let filtered = applicants.filter(applicant => {
      const matchesSearch = !searchTerm || 
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.lib_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !filterDepartment || applicant.branch === filterDepartment;
      const matchesYear = !filterYear || applicant.year.toString() === filterYear;
      
      return matchesSearch && matchesDepartment && matchesYear;
    });
    
    setFilteredApplicants(filtered);
  }, [applicants, searchTerm, filterDepartment, filterYear]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterYear("");
  };

  // Statistics calculations
  const stats = {
    total: filteredApplicants.length,
    pending: filteredApplicants.filter(a => !a.pi || !a.pi.status || a.pi.status === "scheduled").length,
    completed: filteredApplicants.filter(a => a.pi && (a.pi.status === "selected" || a.pi.status === "rejected")).length,
    selected: filteredApplicants.filter(a => a.pi && a.pi.status === "selected").length,
    rejected: filteredApplicants.filter(a => a.pi && a.pi.status === "rejected").length
  };

  const handleOpenEvaluation = (applicant) => {
    setEvaluatingApplicant(applicant);
    setFeedback(applicant.pi?.remarks || "");
    setDecision(applicant.pi?.status === "selected" ? "select" : applicant.pi?.status === "rejected" ? "reject" : "");
  };

  const handleCloseEvaluation = () => {
    setEvaluatingApplicant(null);
    setFeedback("");
    setDecision("");
  };

  const handleSubmitEvaluation = async () => {
    if (!decision) {
      toast.error("Please select either 'Select' or 'Unsure' or 'Reject'");
      return;
    }

    try {
      setSubmitting(true);
      
      // Construct proper status value
      let statusValue;
      if (decision === "select") {
        statusValue = "selected";
      } else if (decision === "unsure") {
        statusValue = "unsure";
      } else if (decision === "reject") {
        statusValue = "rejected";
      } else {
        statusValue = "pending"; // fallback
      }

      // Construct proper remarks
      let remarksValue = String(""); // Ensure it's always a string
      if (remarksValue.trim() === "") {
        if (decision === "select") {
          remarksValue = `Selected for ${domain} domain`;
        } else if (decision === "unsure") {
          remarksValue = "Unsure, Task Submission will be required.";
        } else if (decision === "reject") {
          remarksValue = `Rejected for ${domain} domain`;
        } else {
          remarksValue = "No feedback provided";
        }
      }

      // Validate the data before sending
      const validStatuses = ['selected', 'rejected', 'unsure', 'scheduled', 'pending', 'absent'];
      if (!validStatuses.includes(statusValue)) {
        console.error('Invalid status:', statusValue);
        toast.error('Invalid status selected');
        return;
      }

      // Ensure all fields are strings and properly formatted
      const piData = {
        status: String(statusValue),
        datetime: new Date().toISOString(), // Format: 2025-09-18T16:17:18.689Z
        remarks: remarksValue // Already ensured to be a string above
      };

      console.log('PI Update Request Body:', piData);
      console.log('Email:', evaluatingApplicant.email);

      const updatedApplicant = await apiClient.updateUserPI(evaluatingApplicant.email, piData);

      // Update local state
      setApplicants(prev => 
        prev.map(a => 
          a.email === evaluatingApplicant.email 
            ? { ...a, pi: updatedApplicant.pi }
            : a
        )
      );

      toast.success(
        `${evaluatingApplicant.name} has been ${
          decision === "select" ? "selected" : "rejected"
        } for ${domain} domain interview.`
      );
      
      handleCloseEvaluation();
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to submit evaluation. Please try again.";
      
      if (error.message) {
        if (error.message.includes('422')) {
          errorMessage = "Validation error: Please check the data format. Make sure all fields are filled correctly.";
        } else if (error.message.includes('401')) {
          errorMessage = "Authentication error: Please log in again.";
        } else if (error.message.includes('403')) {
          errorMessage = "Permission denied: You don't have permission to perform this action.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
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
          <p className="text-gray-600 text-lg font-medium">Loading {domain} Interview Candidates...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <div className="max-w-full space-y-4">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{domain} Domain Interviews</h1>
                <p className="text-gray-600">Candidates who cleared GD and Screening rounds</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
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
              className="grid grid-cols-1 md:grid-cols-5 gap-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>For {domain}</span>
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
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-yellow-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Awaiting Interview</span>
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
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span>Interviewed</span>
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
                    <p className="text-sm font-medium text-gray-600">Selected</p>
                    <p className="text-3xl font-bold text-green-600">{stats.selected}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <Star className="w-4 h-4 mr-1" />
                  <span>Final Selection</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-red-600">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span>Not Selected</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Candidates
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or library ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="min-w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-1" />
                Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Interview Candidates ({filteredApplicants.length})
              </h2>
            </div>
          </div>

          {refreshing ? (
            <div className="p-12 text-center">
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
                <p className="text-gray-600 text-lg font-medium">Refreshing candidates data...</p>
              </motion.div>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Candidates Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterDepartment || filterYear
                  ? "No candidates match your current filters."
                  : `No candidates are available for ${domain} domain interviews yet.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
                {filteredApplicants.map((applicant, index) => (
                  <motion.div
                    key={applicant.email}
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      duration: 0.1,
                      ease: "easeOut"
                    }}
                    className="p-6 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                          {/* Basic Info */}
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900">{applicant.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {applicant.email}
                            </div>
                            <div className="text-sm text-gray-500">ID: {applicant.lib_id}</div>
                          </div>
                          
                          {/* Academic Info */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Department</div>
                            <div className="font-medium text-gray-900">{applicant.branch}</div>
                            <div className="text-sm text-gray-500">Year {applicant.year} • Group {applicant.groupNumber}</div>
                          </div>
                          
                          {/* Previous Round Status */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Previous Rounds</div>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                                <span className="text-xs text-green-700">GD: Selected</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                                <span className="text-xs text-green-700">Screening: Selected</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Interview Status */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Interview Status</div>
                            {applicant.pi?.status && applicant.pi.status !== "scheduled" ? (
                              <div className="space-y-1">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  applicant.pi.status === 'selected' 
                                    ? 'bg-green-100 text-green-800' 
                                    : applicant.pi.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {applicant.pi.status.charAt(0).toUpperCase() + applicant.pi.status.slice(1)}
                                </div>
                                {applicant.pi.datetime && (
                                  <div className="text-xs text-gray-500">
                                    {new Date(applicant.pi.datetime).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="ml-4">
                        <button
                          onClick={() => handleOpenEvaluation(applicant)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm group-hover:shadow-md"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {applicant.pi?.status && applicant.pi.status !== "scheduled" ? "Review" : "Interview"}
                        </button>
                      </div>
                    </div>

                    {/* Domain Preferences */}
                    {(applicant.domain_pref_one || applicant.domain_pref_two) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500 mb-2">Domain Preferences</div>
                        <div className="flex flex-wrap gap-2">
                          {applicant.domain_pref_one && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Target className="w-3 h-3 mr-1" />
                              1st: {applicant.domain_pref_one.name}
                            </span>
                          )}
                          {applicant.domain_pref_two && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Target className="w-3 h-3 mr-1" />
                              2nd: {applicant.domain_pref_two.name}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Evaluation Modal */}
      {evaluatingApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{domain} Domain Interview</h2>
                  <p className="text-blue-100 text-sm">{evaluatingApplicant.name}</p>
                </div>
                <button
                  onClick={handleCloseEvaluation}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 overflow-y-auto min-h-0">
              {/* Candidate Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Candidate Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{evaluatingApplicant.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Library ID:</span>
                    <p className="font-medium">{evaluatingApplicant.lib_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <p className="font-medium">{evaluatingApplicant.branch}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Year:</span>
                    <p className="font-medium">Year {evaluatingApplicant.year}</p>
                  </div>
                </div>
                
                {/* Domain Preferences */}
                {(evaluatingApplicant.domain_pref_one || evaluatingApplicant.domain_pref_two) && (
                  <div className="mt-4">
                    <span className="text-gray-500 text-sm">Domain Preferences:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {evaluatingApplicant.domain_pref_one && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <p className="text-xs font-medium text-blue-800">1st Choice: {evaluatingApplicant.domain_pref_one.name}</p>
                          <p className="text-xs text-blue-600 mt-1">{evaluatingApplicant.domain_pref_one.reason}</p>
                        </div>
                      )}
                      {evaluatingApplicant.domain_pref_two && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <p className="text-xs font-medium text-blue-800">2nd Choice: {evaluatingApplicant.domain_pref_two.name}</p>
                          <p className="text-xs text-blue-600 mt-1">{evaluatingApplicant.domain_pref_two.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Screening Remarks */}
                {evaluatingApplicant.screening?.remarks && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800 text-sm">Screening Feedback</span>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {evaluatingApplicant.screening.remarks}
                    </p>
                    {evaluatingApplicant.screening.datetime && (
                      <p className="text-xs text-blue-600 mt-2">
                        Screened on: {new Date(evaluatingApplicant.screening.datetime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Decision Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Interview Decision *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    decision === "select" 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      value="select"
                      checked={decision === "select"}
                      onChange={(e) => setDecision(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        decision === "select" 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {decision === "select" && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-green-700">Select Candidate</div>
                        <div className="text-xs text-green-600">Recommend for {domain} domain</div>
                      </div>
                    </div>
                    {decision === "select" && (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                  </label>
  
                  <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    decision === "unsure" 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      value="unsure"
                      checked={decision === "unsure"}
                      onChange={(e) => setDecision(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        decision === "unsure" 
                          ? 'border-yellow-500 bg-yellow-500' 
                          : 'border-gray-300'
                      }`}>
                        {decision === "unsure" && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-700">Unsure About Candidate</div>
                        <div className="text-xs text-yellow-600">Task Submission will be required.</div>
                      </div>
                    </div>
                    {decision === "unsure" && (
                      <CheckCircle className="w-5 h-5 text-yellow-500 ml-auto" />
                    )}
                  </label>

                  <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    decision === "reject" 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={decision === "reject"}
                      onChange={(e) => setDecision(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        decision === "reject" 
                          ? 'border-red-500 bg-red-500' 
                          : 'border-gray-300'
                      }`}>
                        {decision === "reject" && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-red-700">Reject Candidate</div>
                        <div className="text-xs text-red-600">Not suitable for {domain} domain</div>
                      </div>
                    </div>
                    {decision === "reject" && (
                      <X className="w-5 h-5 text-red-500 ml-auto" />
                    )}
                  </label>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Interview Feedback
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={`Share your feedback about ${evaluatingApplicant.name}'s interview performance...`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide detailed feedback to help improve the candidate's future performance.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseEvaluation}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEvaluation}
                  disabled={!decision || submitting}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center ${
                    !decision || submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit Evaluation
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DomainInterviewBase;
