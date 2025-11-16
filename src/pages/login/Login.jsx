import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useIdeatexAuthStore } from "../../store/ideatexAuthStore";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("recruitment"); // "recruitment" or "ideatex"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Recruitment auth store
  const { 
    login: recruitmentLogin, 
    isLoading: recruitmentLoading, 
    error: recruitmentError, 
    isAuthenticated: recruitmentAuth, 
    clearError: clearRecruitmentError 
  } = useAuthStore();
  
  // Ideatex auth store
  const { 
    login: ideatexLogin, 
    isLoading: ideatexLoading, 
    error: ideatexError, 
    isAuthenticated: ideatexAuth, 
    clearError: clearIdeatexError 
  } = useIdeatexAuthStore();
  
  const navigate = useNavigate();

  // Determine current values based on active tab
  const isLoading = activeTab === "ideatex" ? ideatexLoading : recruitmentLoading;
  const error = activeTab === "ideatex" ? ideatexError : recruitmentError;
  const isAuthenticated = activeTab === "ideatex" ? ideatexAuth : recruitmentAuth;
  const clearError = activeTab === "ideatex" ? clearIdeatexError : clearRecruitmentError;

  // Remove the initializeAuth call from here since it's already handled in App.jsx

  useEffect(() => {
    if (isAuthenticated) {
      // Navigate based on active tab
      if (activeTab === "ideatex") {
        navigate("/ideatex");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, navigate, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Email and Password are required");
      return;
    }
    clearError();
    
    // Use appropriate login function based on active tab
    const loginFn = activeTab === "ideatex" ? ideatexLogin : recruitmentLogin;
    const result = await loginFn({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    
    if (!result.success) {
      console.log("Login failed:", result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center font-caldina p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-100 rounded-full opacity-10"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative  bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-transparent rounded-sm  flex items-center justify-center mx-auto mb-4 ">
          <img 
            // src="https://firebasestorage.googleapis.com/v0/b/endevaour-2023.appspot.com/o/webassets%2Fwhite%20logo%20br.png?alt=media&token=50662b36-d955-4f24-985c-bd73a9101e01" 
            src="/logo.png"
            alt="Recruitment Logo"
            className="w-10 h-10 object-contain rounded-lg shadow-md"
          />
        
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to {activeTab === "ideatex" ? "Ideatex" : "Recruitment"} Portal
          </h1>
          <p className="text-gray-600 text-sm">
            Admin access to manage {activeTab === "ideatex" ? "Ideatex event" : "recruitment process"}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex mb-6 bg-gray-100 rounded-xl p-1"
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab("recruitment");
              clearError();
              setEmail("");
              setPassword("");
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "recruitment"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Recruitment
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("ideatex");
              clearError();
              setEmail("");
              setPassword("");
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "ideatex"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Ideatex
          </button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <button 
                onClick={clearError} 
                className="text-red-600 hover:text-red-700 underline text-xs mt-1 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="admin@company.com"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : activeTab === "ideatex"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-purple-200 hover:shadow-xl"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200 hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-200"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Sign In
              </span>
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Protected by enterprise-grade security
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
