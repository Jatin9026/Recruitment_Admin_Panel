// Test the schema mapping with your sample data
import { testSchemaCompliance } from './schemaValidator.js';

// Your exact sample schema
const sampleApplicantData = {
  _id: "68b92b361d10bca072590908",
  branch: "Electronics and Communication",
  domain_pref_one: {},
  domain_pref_two: {},
  domains: [],
  email: "aarav.mehta@example.com",
  gd: {},
  groupNumber: 83,
  lib_id: "LIB2025EC045",
  linkedIn: "https://www.linkedin.com/in/aaravmehta",
  name: "Aarav Mehta",
  phone: 9876543210,
  pi: {},
  screening: {},
  task: {},
  why_ecell: "I want to explore entrepreneurship",
  year: 3,
  shortlisted: false
};

// Test the mapping
console.log('🧪 Testing with your sample data...');
const isCompliant = testSchemaCompliance(sampleApplicantData);

if (isCompliant) {
  console.log('🎉 SUCCESS: Implementation matches your schema perfectly!');
} else {
  console.log('⚠️  ISSUES: Check console for mapping errors');
}

export { sampleApplicantData };
