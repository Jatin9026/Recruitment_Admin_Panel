import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Mail, FileText, Users, Plus, Minus, Send, Eye, EyeOff, RefreshCw, BarChart3, TrendingUp, User, Calendar, Target, Search, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiClient } from "../../utils/apiConfig";

const BulkMail = () => {
  const location = useLocation();
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("All");
  const [filterRound, setFilterRound] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterSlot, setFilterSlot] = useState("All"); // "All" | "assigned" | "unassigned"
  const [filterDate, setFilterDate] = useState(""); // Selected slot date
  const [filterAttendance, setFilterAttendance] = useState("All"); // "All" | "present" | "absent"
  const [filterPI, setFilterPI] = useState("All"); // "All" | "pi_selected_unsure"
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showStats, setShowStats] = useState(true);
  
  // Batch processing state
  const [batchSize, setBatchSize] = useState(20);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, processed: 0, failed: 0 });
  const [showBatchSettings, setShowBatchSettings] = useState(false);
  
  // Email template state
  const [apiTemplates, setApiTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [useCustomTemplate, setUseCustomTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [templateProps, setTemplateProps] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  // Helper: get PI entry for a specific domain (case-insensitive)
  const getPIEntryForDomain = (applicant, domainName) => {
    if (!domainName || !applicant?.pi?.entries || !Array.isArray(applicant.pi.entries)) return null;
    return applicant.pi.entries.find(e => String(e.domain).toLowerCase() === String(domainName).toLowerCase()) || null;
  };

  // Map PI status -> classes (including rejected)
  const piStatusClasses = {
    selected: "bg-green-100 text-green-800 border-green-200",
    unsure: "bg-yellow-100 text-yellow-800 border-yellow-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    default: "bg-gray-100 text-gray-700 border-gray-200"
  };

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    fetchAllApplicants();
    fetchEmailTemplates();
  }, []);

  const fetchEmailTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await apiClient.getEmailTemplates();
      setApiTemplates(response || []);
      toast.success(`Loaded ${response?.length || 0} email templates`);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      toast.error("Failed to load email templates");
      setApiTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.success("Refreshing applicants and templates data...");
      await Promise.all([
        fetchAllApplicants(),
        fetchEmailTemplates()
      ]);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAllApplicants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      
      // Get all applicants and sort by group number in ascending order
      const sortedApplicants = response.sort((a, b) => {
        const groupA = a.groupNumber || 999999; // Put null/undefined groups at end
        const groupB = b.groupNumber || 999999;
        return groupA - groupB;
      });
      
      setApplicants(sortedApplicants);
      setFilteredApplicants(sortedApplicants);
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

  // Filter applicants by search, domain, round, and group
  useEffect(() => {
    let filtered = applicants;
    
    // Filter by search query (name, email, or lib_id)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(applicant => 
        (applicant.name && applicant.name.toLowerCase().includes(query)) ||
        (applicant.email && applicant.email.toLowerCase().includes(query)) ||
        (applicant.lib_id && applicant.lib_id.toString().toLowerCase().includes(query))
      );
    }
    
    // Filter by domain (if PI filter is set to pi_selected_unsure and a domain chosen,
    // only include applicants who have a PI entry for that domain with selected/unsure)
    if (filterDomain !== "All") {
      filtered = filtered.filter(applicant => {
        const hasDomain = applicant.domains && applicant.domains.includes(filterDomain);
        if (!hasDomain) return false;
        if (filterPI === "pi_selected_unsure") {
          const entry = getPIEntryForDomain(applicant, filterDomain);
          return entry && (entry.status === "selected" || entry.status === "unsure");
        }
        return true;
      });
    }

    // When domain filter isn't selected, filterPI still works globally (existing logic)
    // Filter by round selection status
    if (filterRound !== "All") {
      filtered = filtered.filter(applicant => {
        switch (filterRound) {
          case "screening_selected":
            return applicant.screening && applicant.screening.status === "selected";
          case "gd_scheduled":
            return applicant.gd && applicant.gd.status === "scheduled"; // Check for scheduled status
          case "gd_selected":
            return applicant.gd && applicant.gd.status === "selected";
          case "pi_selected":
            return applicant.pi && applicant.pi.status === "selected";
          case "task_completed":
            return applicant.task && applicant.task.status === "completed";
          case "shortlisted":
            return applicant.shortlisted === true;
          default:
            return true;
        }
      });
    }
    
    // Filter by group number
    if (filterGroup !== "All") {
      if (filterGroup === "unassigned") {
        filtered = filtered.filter(applicant => 
          !applicant.groupNumber || applicant.groupNumber === null || applicant.groupNumber === undefined
        );
      } else {
        filtered = filtered.filter(applicant => 
          applicant.groupNumber === parseInt(filterGroup)
        );
      }
    }
    
    // Filter by slot assignment (assigned / unassigned)
    if (filterSlot !== "All") {
      if (filterSlot === "assigned") {
        filtered = filtered.filter(applicant => Boolean(applicant.assignedSlot));
      } else if (filterSlot === "unassigned") {
        filtered = filtered.filter(applicant => !applicant.assignedSlot);
      }
    }
    
    // Filter by selected date (match assignedSlot start date OR GD datetime date)
    if (filterDate) {
      filtered = filtered.filter(applicant => {
        const slotDate = getAssignedStartDateISO(applicant);
        return slotDate === filterDate;
      });
    }
    
    // Filter by attendance status (isPresent parameter)
    if (filterAttendance !== "All") {
      filtered = filtered.filter(applicant => {
        if (filterAttendance === "present") {
          return applicant.isPresent === true;
        } else if (filterAttendance === "absent") {
          return applicant.isPresent === false;
        }
        return true;
      });
    }

    // Filter by PI selected/unsure (global) - only applied if domain-specific logic above didn't run
    if (filterPI === "pi_selected_unsure" && filterDomain === "All") {
      filtered = filtered.filter(applicant => {
        const entries = applicant?.pi?.entries;
        if (!Array.isArray(entries)) return false;
        return entries.some(e => e && (e.status === "selected" || e.status === "unsure"));
      });
    }
    
    setFilteredApplicants(filtered);
  }, [applicants, searchQuery, filterDomain, filterRound, filterGroup, filterSlot, filterDate, filterAttendance, filterPI]);

  // Helper to parse assignedSlot (same format used by SlotAttendance)
  const parseAssignedSlot = (slotString) => {
    if (!slotString) return null;
    try {
      const [start, end] = slotString.split(' - ');
      const startDate = new Date(start);
      const endDate = new Date(end);
      return {
        startTime: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timeRange: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
      };
    } catch {
      return null;
    }
  };

  // Helper: get assigned slot start date as ISO YYYY-MM-DD (fall back to GD datetime if available)
  const getAssignedStartDateISO = (applicant) => {
    try {
      // Try assignedSlot first (format: "start - end")
      if (applicant?.assignedSlot && typeof applicant.assignedSlot === "string") {
        const [start] = applicant.assignedSlot.split(" - ");
        if (start) {
          const d = new Date(start);
          if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
        }
      }

      // Fallback to GD datetime if present
      if (applicant?.gd?.datetime) {
        const gd = new Date(applicant.gd.datetime);
        if (!isNaN(gd.getTime())) return gd.toISOString().slice(0, 10);
      }

      return null;
    } catch {
      return null;
    }
  };

  // Helper to determine if email API response indicates success
  const isEmailResponseSuccess = (response, batchSize) => {
    // If no response, it's definitely a failure
    if (!response) return false;
    
    // If response explicitly has success property, use it
    if (response.hasOwnProperty('success')) {
      return response.success === true;
    }
    
    // If response has sent_count and total_recipients, check if they make sense
    if (response.hasOwnProperty('sent_count')) {
      // Success if we have sent_count >= 0 and failed_count is reasonable
      const sentCount = response.sent_count || 0;
      const failedCount = response.failed_count || 0;
      const totalRecipients = response.total_recipients || batchSize;
      
      // Consider it successful if sent_count + failed_count matches expected recipients
      // or if sent_count > 0 and total matches
      return sentCount >= 0 && (sentCount + failedCount === totalRecipients || sentCount === totalRecipients);
    }
    
    // If we get here, assume failure unless we have clear success indicators
    return false;
  };

  // Helper to parse assignedSlot and convert to IST for email payload
  const parseAssignedSlotForPayload = (assignedSlot) => {
    if (!assignedSlot || typeof assignedSlot !== 'string') return null;
    
    try {
      // Parse the assignedSlot format: "2025-09-29T13:00:00.000Z - 2025-09-29T13:30:00.000Z"
      if (!assignedSlot.includes(' - ')) return null;
      
      const [startTimeStr] = assignedSlot.split(' - ');
      if (!startTimeStr) return null;
      
      const utcDate = new Date(startTimeStr);
      
      // Check if the date is valid
      if (isNaN(utcDate.getTime())) return null;
      
      // Convert to IST using toLocaleString with Asia/Kolkata timezone
      const istDate = new Date(utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      
      // Format date as "29th September, 2025"
      const day = istDate.getDate();
      const month = istDate.toLocaleString('en-US', { month: 'long', timeZone: "Asia/Kolkata" });
      const year = istDate.getFullYear();
      
      // Add ordinal suffix to day (1st, 2nd, 3rd, 4th, etc.)
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
      
      const formattedDate = `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
      
      // Format time as HH:MM AM/PM in IST
      const formattedTime = utcDate.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
      
      return {
        date: formattedDate,
        time: formattedTime,
        istDate: istDate
      };
    } catch (error) {
      console.error('Error parsing assignedSlot:', error);
      return null;
    }
  };

  const handleApplicantToggle = (email) => {
    setSelectedApplicants(prev =>
      prev.includes(email) 
        ? prev.filter(e => e !== email) 
        : [...prev, email]
    );
  };

  const handleSelectDomain = (domain) => {
    if (domain === "All") {
      if (selectedApplicants.length === filteredApplicants.length) {
        setSelectedApplicants([]);
      } else {
        setSelectedApplicants(filteredApplicants.map(a => a.email));
      }
      return;
    }
    
    const domainApplicants = filteredApplicants
      .filter(a => a.domains && a.domains.includes(domain))
      .map(a => a.email);
    
    setSelectedApplicants(prev => {
      const allSelected = domainApplicants.every(email => prev.includes(email));
      return allSelected
        ? prev.filter(email => !domainApplicants.includes(email))
        : Array.from(new Set([...prev, ...domainApplicants]));
    });
  };

  const handleTemplateSelect = (templateId) => {
    const template = apiTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomSubject(template.subject || "");
      setCustomBody(template.body || "");
      
      // Set up template properties from the custom field array
      const customFields = template.custom || [];
      setTemplateProps(customFields.map(field => ({ key: field, value: "" })));
    }
  };

  const addTemplateProp = () => {
    setTemplateProps(prev => [...prev, { key: "", value: "" }]);
  };

  const removeTemplateProp = (index) => {
    setTemplateProps(prev => prev.filter((_, i) => i !== index));
  };

  const updateTemplateProp = (index, field, value) => {
    setTemplateProps(prev => 
      prev.map((prop, i) => 
        i === index ? { ...prop, [field]: value } : prop
      )
    );
  };

  const generateEmailPayload = () => {
    // Create selected applicant data in the same order as selectedApplicants (emails)
    const selectedApplicantData = selectedApplicants.map(email => 
      filteredApplicants.find(a => a.email === email)
    ).filter(Boolean); // Remove any undefined entries

    // Create custom data object according to API specification
    const customData = {};
    
    // Only add template-specific variables (no extra variables)
    templateProps.forEach(prop => {
      if (prop.key) {
        // Map common variables to applicant data or use provided value
        switch (prop.key.toLowerCase()) {
          case 'date':
          case 'datetime':
            // Priority: 1. assignedSlot (parsed to IST), 2. GD datetime, 3. provided value
            customData[prop.key] = selectedApplicantData.map(a => {
              // First try to use assignedSlot
              if (a.assignedSlot) {
                const slotInfo = parseAssignedSlotForPayload(a.assignedSlot);
                if (slotInfo) {
                  return slotInfo.date;
                }
              }
              
              // Fallback to GD datetime
              if (a.gd && a.gd.datetime) {
                // Parse the ISO string directly without timezone conversion
                const date = new Date(a.gd.datetime);
                // Use UTC methods to avoid timezone issues
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                return `${month}/${day}/${year}`;
              }
              
              return prop.value || "";
            });
            break;
          case 'time':
            // Priority: 1. assignedSlot (parsed to IST), 2. GD datetime, 3. provided value
            customData[prop.key] = selectedApplicantData.map(a => {
              // First try to use assignedSlot
              if (a.assignedSlot) {
                const slotInfo = parseAssignedSlotForPayload(a.assignedSlot);
                if (slotInfo) {
                  return slotInfo.time;
                }
              }
              
              // Fallback to GD datetime
              if (a.gd && a.gd.datetime) {
                // Parse the ISO string directly without timezone conversion
                const date = new Date(a.gd.datetime);
                // Use UTC methods to avoid timezone issues
                let hours = date.getUTCHours();
                const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // 0 should be 12
                const hoursStr = String(hours).padStart(2, '0');
                return `${hoursStr}:${minutes} ${ampm}`;
              }
              
              return prop.value || "";
            });
            break;
          case 'venue':
          case 'location':
            // Use GD venue if available, otherwise use provided value
            customData[prop.key] = selectedApplicantData.map(a => {
              if (a.gd && a.gd.venue) {
                return a.gd.venue;
              }
              return prop.value || "";
            });
            break;
          case 'name':
            // Always use applicant's actual name
            customData[prop.key] = selectedApplicantData.map(a => a.name || "");
            break;
          case 'email':
            // Always use applicant's actual email
            customData[prop.key] = selectedApplicantData.map(a => a.email || "");
            break;
          case 'domain':
            // Use applicant's domain
            customData[prop.key] = selectedApplicantData.map(a => 
              a.domains && a.domains.length > 0 ? a.domains[0] : ""
            );
            break;
          case 'branch':
          case 'department':
            // Use applicant's branch/department
            customData[prop.key] = selectedApplicantData.map(a => a.branch || a.department || "");
            break;
          case 'year':
            // Use applicant's year
            customData[prop.key] = selectedApplicantData.map(a => a.year ? a.year.toString() : "");
            break;
          case 'phone':
            // Use applicant's phone
            customData[prop.key] = selectedApplicantData.map(a => a.phone ? a.phone.toString() : "");
            break;
          case 'library_id':
          case 'lib_id':
          case 'libraryid':
            // Use applicant's library ID
            customData[prop.key] = selectedApplicantData.map(a => a.lib_id || a.libraryId || "");
            break;
          default:
            // For any other custom variable, use the provided value for all recipients
            customData[prop.key] = selectedApplicantData.map(() => prop.value || "");
            break;
        }
      }
    });

    // Return payload according to API specification
    return {
      subject: customSubject,
      emails: selectedApplicants,
      body: customBody,
      bcc: [], // Add admin emails if needed
      custom: customData
    };
  };

  // Generate batch payloads for processing emails in smaller chunks
  const generateBatchPayloads = (batchSize) => {
    const batches = [];
    const allEmails = selectedApplicants;
    
    // Split emails into batches
    for (let i = 0; i < allEmails.length; i += batchSize) {
      const batchEmails = allEmails.slice(i, i + batchSize);
      
      // Get applicant data for this batch
      const batchApplicantData = batchEmails.map(email => 
        filteredApplicants.find(a => a.email === email)
      ).filter(Boolean);

      // Create custom data for this batch
      const customData = {};
      templateProps.forEach(prop => {
        if (prop.key) {
          switch (prop.key.toLowerCase()) {
            case 'date':
            case 'datetime':
              // Priority: 1. assignedSlot (parsed to IST), 2. GD datetime, 3. provided value
              customData[prop.key] = batchApplicantData.map(a => {
                // First try to use assignedSlot
                if (a.assignedSlot) {
                  const slotInfo = parseAssignedSlotForPayload(a.assignedSlot);
                  if (slotInfo) {
                    return slotInfo.date;
                  }
                }
                
                // Fallback to GD datetime
                if (a.gd && a.gd.datetime) {
                  const date = new Date(a.gd.datetime);
                  const year = date.getUTCFullYear();
                  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                  const day = String(date.getUTCDate()).padStart(2, '0');
                  return `${month}/${day}/${year}`;
                }
                
                return prop.value || "";
              });
              break;
            case 'time':
              // Priority: 1. assignedSlot (parsed to IST), 2. GD datetime, 3. provided value
              customData[prop.key] = batchApplicantData.map(a => {
                // First try to use assignedSlot
                if (a.assignedSlot) {
                  const slotInfo = parseAssignedSlotForPayload(a.assignedSlot);
                  if (slotInfo) {
                    return slotInfo.time;
                  }
                }
                
                // Fallback to GD datetime
                if (a.gd && a.gd.datetime) {
                  const date = new Date(a.gd.datetime);
                  let hours = date.getUTCHours();
                  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12;
                  hours = hours ? hours : 12;
                  const hoursStr = String(hours).padStart(2, '0');
                  return `${hoursStr}:${minutes} ${ampm}`;
                }
                
                return prop.value || "";
              });
              break;
            case 'venue':
            case 'location':
              customData[prop.key] = batchApplicantData.map(a => {
                if (a.gd && a.gd.venue) {
                  return a.gd.venue;
                }
                return prop.value || "";
              });
              break;
            case 'name':
              customData[prop.key] = batchApplicantData.map(a => a.name || "");
              break;
            case 'email':
              customData[prop.key] = batchApplicantData.map(a => a.email || "");
              break;
            case 'domain':
              customData[prop.key] = batchApplicantData.map(a => 
                a.domains && a.domains.length > 0 ? a.domains[0] : ""
              );
              break;
            case 'branch':
            case 'department':
              customData[prop.key] = batchApplicantData.map(a => a.branch || a.department || "");
              break;
            case 'year':
              customData[prop.key] = batchApplicantData.map(a => a.year ? a.year.toString() : "");
              break;
            case 'phone':
              customData[prop.key] = batchApplicantData.map(a => a.phone ? a.phone.toString() : "");
              break;
            case 'library_id':
            case 'lib_id':
            case 'libraryid':
              customData[prop.key] = batchApplicantData.map(a => a.lib_id || a.libraryId || "");
              break;
            default:
              customData[prop.key] = batchApplicantData.map(() => prop.value || "");
              break;
          }
        }
      });

      // Create batch payload
      batches.push({
        subject: customSubject,
        emails: batchEmails,
        body: customBody,
        bcc: [],
        custom: customData
      });
    }

    return batches;
  };

  const handleSend = async () => {
    if (!customSubject.trim()) {
      toast.error("Please enter email subject");
      return;
    }
    if (!customBody.trim()) {
      toast.error("Please enter email body");
      return;
    }
    if (selectedApplicants.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    try {
      setSending(true);
      
      // Calculate batch information
      const totalEmails = selectedApplicants.length;
      const batches = generateBatchPayloads(batchSize);
      const totalBatches = batches.length;
      
      // Initialize progress tracking
      setBatchProgress({
        current: 0,
        total: totalBatches,
        processed: 0,
        failed: 0
      });

      let totalProcessed = 0;
      let totalFailed = 0;
      const failedBatches = [];

      toast.success(`Starting batch processing: ${totalEmails} emails in ${totalBatches} batches of ${batchSize}`);
      console.log('Starting batch processing with payload structure:', batches[0]);

      // Process batches sequentially with delay
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchNumber = i + 1;
        
        // Update progress
        setBatchProgress(prev => ({
          ...prev,
          current: batchNumber
        }));

        try {
          toast.loading(`Processing batch ${batchNumber}/${totalBatches} (${batch.emails.length} emails)...`, {
            id: `batch-${batchNumber}`
          });

          const response = await apiClient.sendEmail(batch);
          
          // Log the response for debugging
          console.log(`Batch ${batchNumber} response:`, response);
          
          // Use helper function to determine success
          const isSuccess = isEmailResponseSuccess(response, batch.emails.length);
          
          if (isSuccess) {
            const batchProcessed = response.sent_count || 0;
            const batchFailed = response.failed_count || 0;
            
            // If no explicit counts, assume all emails in batch were processed successfully
            const actualProcessed = (batchProcessed === 0 && batchFailed === 0) ? batch.emails.length : batchProcessed;
            
            totalProcessed += actualProcessed;
            totalFailed += batchFailed;
            
            toast.success(`Batch ${batchNumber}/${totalBatches} completed: ${actualProcessed}/${batch.emails.length} sent`, {
              id: `batch-${batchNumber}`
            });
          } else {
            const batchFailed = response?.failed_count || batch.emails.length;
            totalFailed += batchFailed;
            failedBatches.push({ batch: batchNumber, error: response?.message || 'API returned unsuccessful response' });
            
            toast.error(`Batch ${batchNumber}/${totalBatches} failed: ${response?.message || 'API returned unsuccessful response'}`, {
              id: `batch-${batchNumber}`
            });
          }
        } catch (error) {
          console.error(`Error in batch ${batchNumber}:`, error);
          
          // Check if error response contains useful information
          const errorMessage = error?.response?.data?.message || 
                              error?.response?.data?.detail || 
                              error?.message || 
                              'Network or server error';
          
          totalFailed += batch.emails.length;
          failedBatches.push({ batch: batchNumber, error: errorMessage });
          
          toast.error(`Batch ${batchNumber}/${totalBatches} failed: ${errorMessage}`, {
            id: `batch-${batchNumber}`
          });
        }

        // Update progress
        setBatchProgress(prev => ({
          ...prev,
          processed: totalProcessed,
          failed: totalFailed
        }));

        // Add delay between batches to reduce server load (except for last batch)
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      // Final results
      console.log('Batch processing complete:', {
        totalEmails,
        totalProcessed,
        totalFailed,
        failedBatches,
        successRate: ((totalProcessed / totalEmails) * 100).toFixed(1)
      });
      
      const successRate = ((totalProcessed / totalEmails) * 100).toFixed(1);
      
      if (totalProcessed === totalEmails) {
        toast.success(
          `🎉 All emails sent successfully! ${totalProcessed}/${totalEmails} delivered (100%)`,
          { duration: 6000 }
        );
      } else if (totalProcessed > 0) {
        toast.success(
          `✅ Batch processing completed! ${totalProcessed}/${totalEmails} delivered (${successRate}%)`,
          { duration: 6000 }
        );
        
        if (failedBatches.length > 0) {
          toast.error(
            `⚠️ ${failedBatches.length} batch(es) failed. Check console for details.`,
            { duration: 8000 }
          );
          console.warn('Failed batches:', failedBatches);
        }
      } else {
        toast.error(
          `❌ All batches failed. No emails were sent. Check your connection and try again.`,
          { duration: 8000 }
        );
      }

      // Clear selections if all emails were sent successfully
      if (totalProcessed === totalEmails) {
        setSelectedApplicants([]);
        if (!useCustomTemplate) {
          setSelectedTemplate("");
          setCustomSubject("");
          setCustomBody("");
          setTemplateProps([]);
        }
      }

    } catch (error) {
      console.error("Error in batch processing:", error);
      toast.error("Failed to process bulk emails. Please try again.");
    } finally {
      setSending(false);
      // Reset progress after a delay
      setTimeout(() => {
        setBatchProgress({ current: 0, total: 0, processed: 0, failed: 0 });
      }, 5000);
    }
  };

  // Get unique domains from applicants
  const uniqueDomains = ["All", ...new Set(
    applicants.flatMap(a => a.domains || [])
  )];

  // Get unique group numbers from applicants
  const uniqueGroups = ["All", "unassigned", ...new Set(
    applicants
      .filter(a => a.groupNumber !== null && a.groupNumber !== undefined)
      .map(a => a.groupNumber)
      .sort((a, b) => a - b)
  )];

  // Get unique slot dates from applicants (only dates where slots are assigned)
  const uniqueSlotDates = (() => {
    const dates = new Set();
    applicants.forEach(applicant => {
      const slotDate = getAssignedStartDateISO(applicant);
      if (slotDate) {
        dates.add(slotDate);
      }
    });
    return Array.from(dates).sort();
  })();

  // Round filter options
  const roundOptions = [
    { value: "All", label: "All Applicants" },
    { value: "screening_selected", label: "Screening Selected" },
    { value: "gd_scheduled", label: "GD Scheduled" },
    { value: "gd_selected", label: "GD Selected" },
    { value: "pi_selected", label: "PI Selected" },
    { value: "task_completed", label: "Task Completed" },
    { value: "shortlisted", label: "Shortlisted" }
  ];

  // Statistics calculations
  const stats = {
    total: filteredApplicants.length,
    selected: selectedApplicants.length,
    domains: uniqueDomains.length - 1, // Subtract 1 for "All"
    templates: apiTemplates.length
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5 }
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
          <p className="text-gray-600 text-lg font-medium">Loading Applicants...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50 px-6 py-4"
    >
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Email System</h1>
                <p className="text-gray-600">Send personalized emails to applicants with advanced filtering</p>
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
                  <span>All Applicants</span>
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
                    <p className="text-sm font-medium text-gray-600">Selected for Email</p>
                    <p className="text-3xl font-bold text-green-600">{stats.selected}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>Ready to Send</span>
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
                    <p className="text-sm font-medium text-gray-600">Active Domains</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.domains}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-purple-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Domains Available</span>
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
                    <p className="text-sm font-medium text-gray-600">API Templates</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.templates}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-orange-600">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{loadingTemplates ? 'Loading...' : 'From API'}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="font-semibold text-lg mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Filter Applicants
          </h2>
          
          {/* Search Box */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Search Applicants</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.input
                type="text"
                placeholder="Search by name, email, or library ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500"
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </motion.button>
              )}
            </div>
            {searchQuery && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-blue-600 mt-2"
              >
                Found {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </motion.p>
            )}
          </div>
          
          {/* Domain Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">By Domain</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueDomains.map((domain, index) => (
                <motion.button
                  key={domain}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterDomain(domain)}
                  title={domain === "All" ? 'All domains' : `Show applicants for ${domain}`}
                  className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                    filterDomain === domain
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {domain} {domain !== "All" && `(${applicants.filter(a => a.domains?.includes(domain)).length})`}
                </motion.button>
              ))}
            </div>
          </div>

          {/* PI Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">PI Filter</h3>
            <select
              value={filterPI}
              onChange={(e) => setFilterPI(e.target.value)}
              className="w-full md:w-48 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="All">All PI Status</option>
              <option value="pi_selected_unsure">PI: Selected or Unsure</option>
            </select>
          </div>

          {/* Round Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">By Round Status</h3>
            <div className="flex flex-wrap gap-2">
              {roundOptions.map((round, index) => (
                <motion.button
                  key={round.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterRound(round.value)}
                  className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                    filterRound === round.value
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {round.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Group Filter */}
          <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">By Group Number</h3>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full md:w-64 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              >
                {uniqueGroups.map((group) => (
                  <option key={group} value={group.toString()}>
                    {group === "unassigned" 
                      ? `Unassigned (${applicants.filter(a => !a.groupNumber).length})` 
                      : group === "All" 
                      ? "All Groups" 
                      : `Group ${group} (${applicants.filter(a => a.groupNumber === group).length})`
                    }
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Filter */}
            <div className="mt-3 md:mt-0">
              <h3 className="font-medium text-gray-700 mb-3">Attendance Status</h3>
              <select
                value={filterAttendance}
                onChange={(e) => setFilterAttendance(e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                title="Filter by attendance status"
              >
                <option value="All">All Students ({applicants.length})</option>
                <option value="present">Present ({applicants.filter(a => a.isPresent === true).length})</option>
                <option value="absent">Absent ({applicants.filter(a => a.isPresent === false).length})</option>
              </select>
            </div>

            {/* Slot Assignment Filter (side of Group dropdown) */}
            <div className="mt-3 md:mt-0">
              <h3 className="font-medium text-gray-700 mb-3">Slot Status & Date</h3>
              <select
                value={filterSlot}
                onChange={(e) => setFilterSlot(e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                title="Filter by slot assignment"
              >
                <option value="All">All Slots</option>
                <option value="assigned">Assigned Slot</option>
                <option value="unassigned">Unassigned Slot</option>
              </select>

              {/* Slot Date Filter Dropdown */}
              <div className="mt-3">
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full md:w-48 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  title="Filter by slot assignment date"
                >
                  <option value="">All Slot Dates</option>
                  {uniqueSlotDates.map((date) => {
                    const formattedDate = new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const count = applicants.filter(a => getAssignedStartDateISO(a) === date).length;
                    return (
                      <option key={date} value={date}>
                        {formattedDate} ({count} slots)
                      </option>
                    );
                  })}
                </select>
                {uniqueSlotDates.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No slot dates available</p>
                )}
              </div>
            </div>
          </div>

          {/* Select All Button for Current Filter */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (selectedApplicants.length === filteredApplicants.length) {
                  setSelectedApplicants([]);
                } else {
                  setSelectedApplicants(filteredApplicants.map(a => a.email));
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {selectedApplicants.length === filteredApplicants.length ? 'Deselect All' : 'Select All'} Filtered ({filteredApplicants.length})
            </motion.button>
          </div>
        </motion.div>

        {/* Batch Processing Configuration */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Batch Processing Settings
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBatchSettings(!showBatchSettings)}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Target className="w-4 h-4" />
              <span>{showBatchSettings ? 'Hide' : 'Show'} Settings</span>
            </motion.button>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Batch Processing Enabled</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Emails will be sent in batches of <strong>{batchSize}</strong> to reduce server load and improve reliability.
                </p>
                <div className="flex items-center space-x-4 text-xs text-blue-600">
                  <span>• Prevents server overload</span>
                  <span>• Better error handling</span>
                  <span>• Progress tracking</span>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showBatchSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Batch Size (emails per batch)
                  </label>
                  <div className="w-full flex justify-start items-center space-x-4">
                    <div className="w-1/3">
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="5"
                          max="50"
                          step="5"
                          value={batchSize}
                          onChange={(e) => setBatchSize(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="min-w-[60px] text-center">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
                            {batchSize}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5 (Slower, Safer)</span>
                        <span>50 (Faster, Higher Load)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.ceil(selectedApplicants.length / batchSize)}
                    </div>
                    <div className="text-sm text-gray-600">Total Batches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.ceil(selectedApplicants.length / batchSize) * 1}s
                    </div>
                    <div className="text-sm text-gray-600">Est. Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedApplicants.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Recipients</div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800 font-medium">Batch Processing Info</span>
                  </div>
                  <ul className="text-xs text-yellow-700 mt-2 space-y-1 ml-6">
                    <li>• Smaller batches = Higher reliability, slower processing</li>
                    <li>• Larger batches = Faster processing, higher server load</li>
                    <li>• 1 second delay between batches to prevent overload</li>
                    <li>• Failed batches will be logged for retry</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Display */}
          <AnimatePresence>
            {sending && batchProgress.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    Processing Batch {batchProgress.current} of {batchProgress.total}
                  </span>
                  <span className="text-sm text-blue-700">
                    {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(batchProgress.current / batchProgress.total) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                    className="bg-blue-600 h-2 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-700">
                  <span>✅ Sent: {batchProgress.processed}</span>
                  <span>❌ Failed: {batchProgress.failed}</span>
                  <span>📧 Total: {selectedApplicants.length}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Email Template Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Email Template Configuration
          </h2>
          
          {/* Template Type Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex space-x-4 mb-6"
          >
            <motion.label
              whileHover={{ scale: 1.02 }}
              className="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="templateType"
                checked={!useCustomTemplate}
                onChange={() => setUseCustomTemplate(false)}
                className="mr-2"
              />
              <span className="font-medium">Saved Templates</span>
            </motion.label>
            <motion.label
              whileHover={{ scale: 1.02 }}
              className="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="templateType"
                checked={useCustomTemplate}
                onChange={() => setUseCustomTemplate(true)}
                className="mr-2"
              />
              <span className="font-medium">Custom Template</span>
            </motion.label>
          </motion.div>

          <AnimatePresence mode="wait">
            {!useCustomTemplate ? (
              /* Saved Templates */
              <motion.div
                key="saved"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-medium mb-2">Select API Template</label>
                  {loadingTemplates ? (
                    <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                      />
                      <span className="text-gray-600">Loading templates...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">-- Select Template --</option>
                      {apiTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.subject || `Template ${template.id}`}
                        </option>
                      ))}
                    </select>
                  )}
                  {!loadingTemplates && apiTemplates.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No templates available. Create templates in the Mail Templates page.
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Custom Template */
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block font-medium mb-2">Body (HTML)</label>
                  <textarea
                    rows={8}
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    placeholder="Enter HTML email body with variables like {{name}}, {{domain}}, etc."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Template Properties */}
          <AnimatePresence>
            {(selectedTemplate || useCustomTemplate) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Template Variables</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addTemplateProp}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variable
                  </motion.button>
                </div>
                
                <div className="space-y-3">
                  <AnimatePresence>
                    {templateProps.map((prop, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex space-x-2"
                      >
                        <input
                          type="text"
                          placeholder="Variable name (e.g., date)"
                          value={prop.key}
                          onChange={(e) => updateTemplateProp(index, 'key', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Value for all recipients"
                          value={prop.value}
                          onChange={(e) => updateTemplateProp(index, 'value', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeTemplateProp(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 p-3 bg-blue-50 rounded-lg"
                >
                  <p className="text-sm text-blue-700">
                    <strong>Auto-Mapped Variables:</strong> 
                    <span className="block mt-1">
                      • <code>name</code>, <code>email</code>, <code>phone</code> → From applicant profile<br/>
                      • <code>domain</code>, <code>branch</code>, <code>year</code> → From applicant academic info<br/>
                      • <code>date</code> → "29th September, 2025" format from assignedSlot (IST)<br/>
                      • <code>time</code> → "06:30 PM" format from assignedSlot (IST)<br/>
                      • <code>venue</code> → From GD venue (if available)<br/>
                      • Custom variables → Use your provided values
                    </span>
                  </p>
                  {selectedTemplate && (
                    <div className="mt-3 p-2 bg-blue-100 rounded">
                      <p className="text-sm text-blue-600">
                        <strong>Template Custom Fields:</strong> {apiTemplates.find(t => t.id === selectedTemplate)?.custom?.join(', ') || 'None'}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Template Preview */}
          <AnimatePresence>
            {(customSubject || customBody) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
                      transition={{ duration: 0.2 }}
                      className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50"
                    >
                      <h4 className="font-medium mb-2">Subject Preview:</h4>
                      <p className="mb-4 p-2 bg-white rounded border">{customSubject}</p>
                      <h4 className="font-medium mb-2">Body Preview:</h4>
                      <div 
                        className="p-4 bg-white rounded border min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: customBody }}
                      />
                      {selectedTemplate && (
                        <div className="mt-4 p-3 bg-gray-100 rounded">
                          <h5 className="font-medium text-sm mb-2">Template Info:</h5>
                          <p className="text-xs text-gray-600">
                            Template ID: {selectedTemplate}<br/>
                            Custom Fields: {apiTemplates.find(t => t.id === selectedTemplate)?.custom?.join(', ') || 'None'}<br/>
                            Created: {apiTemplates.find(t => t.id === selectedTemplate)?.created_at ? 
                              new Date(apiTemplates.find(t => t.id === selectedTemplate).created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Debug Payload Preview */}
          <AnimatePresence>
            {(customSubject || customBody) && selectedApplicants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPayload(!showPayload)}
                  className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  {showPayload ? 'Hide' : 'Show'} API Payload
                </motion.button>
                
                <AnimatePresence>
                  {showPayload && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 p-4 border border-green-300 rounded-lg bg-green-50"
                    >
                      <h4 className="font-medium mb-2 text-green-800">Email API Payload:</h4>
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto text-gray-700">
                        {JSON.stringify(generateEmailPayload(), null, 2)}
                      </pre>
                      <p className="text-xs text-green-600 mt-2">
                        This is the exact payload that will be sent to the email API endpoint.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Send Button */}
          <AnimatePresence>
            {(selectedTemplate || useCustomTemplate) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <motion.button
                  onClick={handleSend}
                  disabled={sending || selectedApplicants.length === 0 || !customSubject || !customBody}
                  whileHover={{ 
                    scale: sending || selectedApplicants.length === 0 || !customSubject || !customBody ? 1 : 1.02,
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.25)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center text-lg ${
                    sending || selectedApplicants.length === 0 || !customSubject || !customBody
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {sending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      {batchProgress.total > 0 
                        ? `Processing Batch ${batchProgress.current}/${batchProgress.total}...`
                        : 'Sending Emails...'
                      }
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send in {Math.ceil(selectedApplicants.length / batchSize)} Batches ({selectedApplicants.length} recipients)
                    </>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {selectedApplicants.length === 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-gray-500 text-center mt-2"
                    >
                      Please select at least one recipient to send emails
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recipients List */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Applicants
            </h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full"
            >
              {selectedApplicants.length} of {filteredApplicants.length} selected
            </motion.div>
          </div>

          {refreshing ? (
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
                <p className="text-gray-600 text-lg font-medium">Refreshing candidates data...</p>
              </motion.div>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Selected Applicants</h3>
              <p className="text-gray-500">
                {filterDomain === "All" 
                  ? "No applicants have been selected yet."
                  : `No applicants selected for ${filterDomain} domain.`
                }
              </p>
            </motion.div>
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
                        <motion.input
                          type="checkbox"
                          checked={selectedApplicants.includes(applicant.email)}
                          onChange={() => handleApplicantToggle(applicant.email)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="h-5 w-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 transition-transform"
                        />
                        
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
                            <div className="text-sm text-gray-500">ID: {applicant.lib_id || 'N/A'}</div>
                          </div>
                          
                          {/* Academic Info & Attendance */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Department</div>
                            <div className="font-medium text-gray-900">{applicant.branch}</div>
                            <div className="text-sm text-gray-500">
                              Year {applicant.year} {applicant.groupNumber && `• Group ${applicant.groupNumber}`}
                            </div>
                            <div className="mt-2">
                              {applicant.isPresent === true ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Present
                                </span>
                              ) : applicant.isPresent === false ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  <X className="w-3 h-3 mr-1" />
                                  Absent
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  No Record
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* GD Info */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">GD Schedule</div>
                            {applicant.gd?.datetime ? (
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(applicant.gd.datetime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}, {new Date(applicant.gd.datetime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                {applicant.gd.venue && (
                                  <div className="text-xs text-gray-500">{applicant.gd.venue}</div>
                                )}
                              </div>
                            ) : applicant.assignedSlot ? (
                              (() => {
                                const slotInfo = parseAssignedSlot(applicant.assignedSlot);
                                return slotInfo ? (
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {slotInfo.startTime}, {slotInfo.startDate}
                                    </div>
                                    <div className="text-xs text-gray-500">{slotInfo.timeRange}</div>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Assigned (invalid format)
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <Calendar className="w-3 h-3 mr-1" />
                                Not Scheduled
                              </span>
                            )}
                          </div>
                          
                          {/* Domain Preferences */}
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Domain Preferences</div>
                            {applicant.domains && applicant.domains.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {applicant.domains.slice(0, 2).map((domain, idx) => {
                                  const entry = getPIEntryForDomain(applicant, domain);
                                  const status = entry?.status || 'default';
                                  const cls = piStatusClasses[status] || piStatusClasses.default;
                                  return (
                                    <span key={idx} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
                                      {domain}
                                    </span>
                                  );
                                })}
                                {applicant.domains.length > 2 && (
                                  <span className="text-xs text-gray-500">+{applicant.domains.length - 2} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">No preferences</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Selection Status */}
                      <div className="ml-4">
                        {selectedApplicants.includes(applicant.email) ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Selected</span>
                          </motion.div>
                        ) : (
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Not Selected
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BulkMail;
