import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  ArrowRight,
  RefreshCw,
  TrendingUp,
  BarChart3,
  UserCheck,
  Target,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { apiClient } from "../../utils/apiConfig";
import useApplicantStore from "../../store/applicantStore";
import toast, { Toaster } from "react-hot-toast";

const PendingScreening = () => {
  const { applicants, fetchApplicants } = useApplicantStore();
  const location = useLocation();
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showStats, setShowStats] = useState(true);

  const departments = [...new Set(applicants.map(a => a.department).filter(Boolean))];
  const years = [...new Set(applicants.map(a => a.year).filter(Boolean))].sort();

  // Function to refresh only the applicants data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.success("Refreshing applicants data...");
      
      // Debug: Test direct API call to see raw response
      // console.log("Refreshing applicants data...");
      // const directResponse = await apiClient.getUsers();
      // console.log("Direct API response:", directResponse);
      
      await fetchApplicants();
      toast.success("Applicants data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing applicants:", error);
      toast.error("Failed to refresh applicants data");
    } finally {
      setRefreshing(false);
    }
    setFilterStatus("pending");
  };

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setFilterStatus("pending");
  }, [location.pathname]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Debug: Test direct API call to see raw response
        console.log("Testing direct API call...");
        const directResponse = await apiClient.getUsers();
        console.log("Direct API response:", directResponse);
        
        await fetchApplicants();
      } catch (error) {
        console.error("Error fetching applicants:", error);
        toast.error("Failed to load applicants");
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
    
    loadData();
  }, [fetchApplicants]);

  // Filter for GD selected applicants and apply other filters
  useEffect(() => {
    // First filter for GD selected applicants
    const gdSelected = applicants.filter(
      (applicant) => applicant.gd && applicant.gd.status === "selected"
    );
    
    console.log("All applicants:", applicants.length);
    console.log("GD Selected Applicants:", gdSelected.length, gdSelected);

    // Then apply additional filters
    let filtered = gdSelected.filter(applicant => {
      const matchesSearch = !searchTerm || 
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.libraryId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !filterDepartment || applicant.department === filterDepartment;
      const matchesYear = !filterYear || applicant.year.toString() === filterYear;
      
      // Status filter based on screening status
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "pending" && (!applicant.screening || !applicant.screening.status || applicant.screening.status === "scheduled")) ||
        (filterStatus === "selected" && applicant.screening && applicant.screening.status === "selected") ||
        (filterStatus === "rejected" && applicant.screening && applicant.screening.status === "rejected");
      
      return matchesSearch && matchesDepartment && matchesYear && matchesStatus;
    });
    
    setFilteredApplicants(filtered);
  }, [applicants, searchTerm, filterDepartment, filterYear, filterStatus]);



  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterYear("");
    setFilterStatus("pending");
  };

  // Statistics calculations - based on GD selected applicants only
  const gdSelectedApplicants = applicants.filter(a => a.gd && a.gd.status === "selected");
  const stats = {
    total: gdSelectedApplicants.length,
    pending: gdSelectedApplicants.filter(a => !a.screening || !a.screening.status || a.screening.status === "scheduled").length,
    selected: gdSelectedApplicants.filter(a => a.screening && a.screening.status === "selected").length,
    rejected: gdSelectedApplicants.filter(a => a.screening && a.screening.status === "rejected").length
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
          <p className="text-gray-600 text-lg font-medium">Loading GD Selected Candidates...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <div className="space-y-6">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Screening Dashboard</h1>
                <p className="text-gray-600">Candidates selected from Group Discussion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 bg-white border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-gray-400"
              >
                {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{showStats ? "Hide" : "Show"} Stats</span>
              </button> */}
              {/* <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                  refreshing
                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-gray-400"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button> */}
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
                    <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>From GD Round</span>
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
                  <span>Awaiting Screening</span>
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
                    <p className="text-sm font-medium text-gray-600">Selected</p>
                    <p className="text-3xl font-bold text-green-600">{stats.selected}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  <span>To Interview</span>
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
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Users className="w-6 h-6 text-red-600" />
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

            {/* Status Filter */}
            <div className="min-w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
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
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Candidates for Screening ({filteredApplicants.length})
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
                {searchTerm || filterDepartment || filterYear || filterStatus !== "all"
                  ? "No candidates match your current filters."
                  : "No candidates have been selected from GD round yet."
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
                              <div className="text-sm text-gray-500">ID: {applicant.libraryId}</div>
                            </div>                          {/* Academic Info */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Department</div>
                            <div className="font-medium text-gray-900">{applicant.department}</div>
                            <div className="text-sm text-gray-500">Year {applicant.year} • Group {applicant.groupNumber}</div>
                          </div>
                          
                          {/* GD Info */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">GD Performance</div>
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-sm font-medium text-green-700">Selected</span>
                            </div>
                            {applicant.gd?.datetime && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(applicant.gd.datetime).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          {/* Screening Status */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Screening Status</div>
                            {applicant.screening?.status && applicant.screening.status !== "scheduled" ? (
                              <div className="space-y-1">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  applicant.screening.status === 'selected' 
                                    ? 'bg-green-100 text-green-800' 
                                    : applicant.screening.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {applicant.screening.status.charAt(0).toUpperCase() + applicant.screening.status.slice(1)}
                                </div>
                                {applicant.screening.datetime && (
                                  <div className="text-xs text-gray-500">
                                    {new Date(applicant.screening.datetime).toLocaleDateString()}
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
                        <Link
                          to={`/screening/evaluate/${applicant.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm group-hover:shadow-md"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Evaluate
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>

                    {/* Additional Info (Domain Preferences) */}
                    {(applicant.domainPrefOne || applicant.domainPrefTwo) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500 mb-2">Domain Preferences</div>
                        <div className="flex flex-wrap gap-2">
                          {/* {applicant.domains && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Target className="w-3 h-3 mr-1" />
                              Domains: {applicant.domains.join(", ")}
                            </span>
                          )} */}
                          {applicant.domainPrefOne && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Target className="w-3 h-3 mr-1" />
                              1st: {applicant.domainPrefOne.name}
                            </span>
                          )}
                          {applicant.domainPrefTwo && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              <Target className="w-3 h-3 mr-1" />
                              2nd: {applicant.domainPrefTwo.name}
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
    </div>
  );
};

export default PendingScreening;
