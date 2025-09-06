// Schema Verification and Mapping Utility
// This file helps verify that our frontend mapping matches the backend schema

export const EXPECTED_APPLICANT_SCHEMA = {
  // Core identification
  _id: "ObjectId('68b92b361d10bca072590908')", // Maps to: id
  email: "aarav.mehta@example.com",
  
  // Personal Information  
  name: "Aarav Mehta",
  phone: 9876543210,
  year: 3,
  lib_id: "LIB2025EC045", // Maps to: libraryId
  branch: "Electronics and Communication", // Maps to: department
  linkedIn: "https://www.linkedin.com/in/aaravmehta", // Maps to: linkedIn
  why_ecell: "I want to explore entrepreneurship...", // Maps to: whyEcell
  
  // Domain Preferences
  domain_pref_one: {}, // Maps to: domainPrefOne
  domain_pref_two: {}, // Maps to: domainPrefTwo
  domains: [], // Array(2) - Maps to: domains
  
  // Group Assignment
  groupNumber: 83, // Maps to: groupNumber (NOT group!)
  
  // Application Status
  shortlisted: false, // Maps to: shortlisted
  
  // Round Status Objects
  gd: {}, // Maps to: gd
  screening: {}, // Maps to: screening  
  pi: {}, // Maps to: pi
  task: {}, // Maps to: task
};

export const FRONTEND_MAPPING = {
  // Core fields
  id: '_id',
  email: 'email',
  name: 'name', 
  phone: 'phone',
  year: 'year',
  
  // Mapped fields (backend -> frontend)
  libraryId: 'lib_id',
  department: 'branch', 
  linkedIn: 'linkedIn',
  whyEcell: 'why_ecell',
  domainPrefOne: 'domain_pref_one',
  domainPrefTwo: 'domain_pref_two',
  domains: 'domains',
  groupNumber: 'groupNumber', // CRITICAL: Must be groupNumber, not group!
  shortlisted: 'shortlisted',
  
  // Round status objects
  gd: 'gd',
  screening: 'screening',
  pi: 'pi', 
  task: 'task',
  
  // Additional frontend fields
  status: 'status', // Derived field
  appliedAt: 'createdAt', // Mapped from createdAt
  slot: 'slot', // Derived field
};

// Validation function to check if mapping is correct
export const validateApplicantMapping = (backendData, frontendData) => {
  const errors = [];
  
  // Check core ID mapping
  if (frontendData.id !== backendData._id) {
    errors.push(`ID mapping error: expected ${backendData._id}, got ${frontendData.id}`);
  }
  
  // Check groupNumber mapping (most critical)
  if (frontendData.groupNumber !== backendData.groupNumber) {
    errors.push(`GroupNumber mapping error: expected ${backendData.groupNumber}, got ${frontendData.groupNumber}`);
  }
  
  // Check department mapping
  if (frontendData.department !== backendData.branch) {
    errors.push(`Department mapping error: expected ${backendData.branch}, got ${frontendData.department}`);
  }
  
  // Check library ID mapping
  if (frontendData.libraryId !== backendData.lib_id) {
    errors.push(`LibraryId mapping error: expected ${backendData.lib_id}, got ${frontendData.libraryId}`);
  }
  
  // Check domain preferences
  if (JSON.stringify(frontendData.domainPrefOne) !== JSON.stringify(backendData.domain_pref_one)) {
    errors.push(`DomainPrefOne mapping error`);
  }
  
  if (JSON.stringify(frontendData.domainPrefTwo) !== JSON.stringify(backendData.domain_pref_two)) {
    errors.push(`DomainPrefTwo mapping error`);
  }
  
  // Check why_ecell mapping
  if (frontendData.whyEcell !== backendData.why_ecell) {
    errors.push(`WhyEcell mapping error: expected ${backendData.why_ecell}, got ${frontendData.whyEcell}`);
  }
  
  return errors;
};

// Function to map backend data to frontend format
export const mapBackendToFrontend = (backendUser) => {
  return {
    id: backendUser._id,
    name: backendUser.name,
    email: backendUser.email,
    phone: backendUser.phone,
    year: backendUser.year,
    libraryId: backendUser.lib_id,
    linkedIn: backendUser.linkedIn || "",
    department: backendUser.branch,
    whyEcell: backendUser.why_ecell || "",
    domainPrefOne: backendUser.domain_pref_one || {},
    domainPrefTwo: backendUser.domain_pref_two || {},
    domains: backendUser.domains || [],
    groupNumber: backendUser.groupNumber || null, // CRITICAL: Use groupNumber
    status: backendUser.status || "Pending",
    appliedAt: backendUser.createdAt || new Date().toISOString(),
    slot: backendUser.slot || null,
    shortlisted: backendUser.shortlisted || false,
    // Round status objects
    screening: backendUser.screening || {},
    gd: backendUser.gd || {},
    pi: backendUser.pi || {},
    task: backendUser.task || {},
  };
};

// Function to check if an applicant is unassigned (no group number)
export const isUnassigned = (applicant) => {
  return !applicant.groupNumber || 
         applicant.groupNumber === null || 
         applicant.groupNumber === undefined;
};

// Function to filter unassigned applicants
export const filterUnassigned = (applicants) => {
  return applicants.filter(isUnassigned);
};

// Test function to verify schema compliance
export const testSchemaCompliance = (sampleBackendData) => {
  console.log('🔍 Testing Schema Compliance...');
  
  const mapped = mapBackendToFrontend(sampleBackendData);
  const errors = validateApplicantMapping(sampleBackendData, mapped);
  
  if (errors.length === 0) {
    console.log('✅ Schema mapping is CORRECT!');
    console.log('📋 Frontend object structure:', mapped);
  } else {
    console.log('❌ Schema mapping has ERRORS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return errors.length === 0;
};

export default {
  EXPECTED_APPLICANT_SCHEMA,
  FRONTEND_MAPPING,
  validateApplicantMapping,
  mapBackendToFrontend,
  isUnassigned,
  filterUnassigned,
  testSchemaCompliance
};
