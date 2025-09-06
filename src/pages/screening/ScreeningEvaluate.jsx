import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building, 
  Calendar, 
  Award, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Save, 
  Clock,
  MessageSquare,
  Users,
  Target
} from "lucide-react";
import { apiClient } from "../../utils/apiConfig";
import useApplicantStore from "../../store/applicantStore";
import toast, { Toaster } from "react-hot-toast";

const ScreeningEvaluate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { applicants, fetchApplicants } = useApplicantStore();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState("");
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [remarks, setRemarks] = useState("");

  const availableDomains = [
    "Technical",
    "Corporate Relations", 
    "Public Relations",
    "Events",
    "Graphics"
  ];

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // Get domains that are not already assigned to the user
  const getAvailableDomains = () => {
    if (!applicant?.domains) return availableDomains;
    return availableDomains.filter(domain => !applicant.domains.includes(domain));
  };

  const decisionOptions = [
    { value: "selected", label: "Select for Next Round", color: "green", icon: CheckCircle },
    { value: "rejected", label: "Reject Candidate", color: "red", icon: XCircle }
  ];

  useEffect(() => {
    const loadApplicantData = async () => {
      try {
        setLoading(true);
        
        // Ensure applicants are loaded
        if (applicants.length === 0) {
          await fetchApplicants();
        }
      } catch (error) {
        console.error("Error loading applicants:", error);
        toast.error("Failed to load applicant data");
        navigate("/screening");
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

    loadApplicantData();
  }, [fetchApplicants, applicants.length, navigate]);

  // Find the applicant from the store once applicants are loaded
  useEffect(() => {
    if (applicants.length > 0 && id) {
      console.log("Looking for applicant with ID:", id);
      console.log("Available applicants:", applicants.map(a => ({ id: a.id, email: a.email, name: a.name })));
      
      const foundApplicant = applicants.find(a => 
        a.id === id || 
        a.email === id ||
        a.libraryId === id
      );
      
      console.log("Found applicant:", foundApplicant);
      
      if (foundApplicant) {
        setApplicant(foundApplicant);
      } else if (!loading) {
        // Only redirect if we're not loading and have checked all applicants
        console.error("Applicant not found with ID:", id);
        toast.error("Applicant not found");
        navigate("/screening");
      }
    }
  }, [applicants, id, navigate, loading]);

  const handleDomainToggle = (domain) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleSubmit = async () => {
    if (!decision) {
      toast.error("Please select a decision");
      return;
    }

    if (decision === "selected" && selectedDomains.length === 0) {
      toast.error("Please select at least one domain for selected candidates");
      return;
    }

    try {
      setSubmitting(true);
      
      const screeningData = {
        status: decision,
        datetime: new Date().toISOString(),
        remarks: remarks || (decision === "selected" ? "Selected for next round" : "Not selected")
      };

      // Add domains only if candidate is selected
      if (decision === "selected") {
        screeningData.domains = selectedDomains;
      }

      await apiClient.updateUserScreening(applicant.email, screeningData);
      
      toast.success(`Candidate ${decision === "selected" ? "selected" : "rejected"} successfully!`);
      navigate("/screening");
    } catch (err) {
      console.error("Error updating screening:", err);
      toast.error("Failed to save screening evaluation.");
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
          <p className="text-gray-600 text-lg font-medium">Loading candidate details...</p>
        </motion.div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Candidate Not Found</h3>
          <p className="text-gray-500 mb-4">The requested candidate could not be found.</p>
          <button
            onClick={() => navigate("/screening")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Screening
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/screening")}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Screening Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Screening Evaluation</h1>
                  <p className="text-gray-600 mt-1">Review and evaluate candidate performance</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Candidate ID</div>
                <div className="font-mono text-lg text-blue-600">{applicant.libraryId}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Candidate Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-gray-50 border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{applicant.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {applicant.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {applicant.phone}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Group {applicant.groupNumber}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Department</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{applicant.department}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Year</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">Year {applicant.year}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Award className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">GD Status</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Selected
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">GD Date</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {applicant.gd?.datetime ? new Date(applicant.gd.datetime).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>

              {/* Domain Preferences */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Domain Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-800 mb-1">First Preference</div>
                    <div className="text-lg font-semibold text-blue-900">{applicant.domainPrefOne?.name}</div>
                    <div className="text-sm text-blue-700 mt-2">"{applicant.domainPrefOne?.reason}"</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Second Preference</div>
                    <div className="text-lg font-semibold text-gray-900">{applicant.domainPrefTwo?.name}</div>
                    <div className="text-sm text-gray-600 mt-2">"{applicant.domainPrefTwo?.reason}"</div>
                  </div>
                </div>
              </div>

              {/* GD Remarks */}
              {applicant.gd?.remarks && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">GD Feedback</h3>
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                    <p className="text-green-800 italic">"{applicant.gd.remarks}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Evaluation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
            Screening Evaluation
          </h3>

          {/* Decision Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Evaluation Decision *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decisionOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      decision === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => setDecision(option.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        decision === option.value 
                          ? `bg-${option.color}-100` 
                          : "bg-gray-100"
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          decision === option.value 
                            ? `text-${option.color}-600` 
                            : "text-gray-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${
                          decision === option.value 
                            ? `text-${option.color}-900` 
                            : "text-gray-900"
                        }`}>
                          {option.label}
                        </div>
                      </div>
                      {decision === option.value && (
                        <div className={`w-4 h-4 rounded-full bg-${option.color}-500`} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Domain Selection (only if selected) */}
          <AnimatePresence>
            {decision === "selected" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Domains for Interview *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {availableDomains.map((domain) => (
                    <motion.div
                      key={domain}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                        selectedDomains.includes(domain)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleDomainToggle(domain)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          selectedDomains.includes(domain) 
                            ? "text-blue-900" 
                            : "text-gray-700"
                        }`}>
                          {domain}
                        </span>
                        {selectedDomains.includes(domain) && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Select domains where this candidate will be interviewed
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remarks */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Remarks & Feedback
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Add any additional comments or feedback about the candidate..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate("/screening")}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!decision || submitting}
              className={`px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center ${
                decision === "selected"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : decision === "rejected"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {decision === "selected" ? "Select Candidate" : decision === "rejected" ? "Reject Candidate" : "Submit Evaluation"}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScreeningEvaluate;
