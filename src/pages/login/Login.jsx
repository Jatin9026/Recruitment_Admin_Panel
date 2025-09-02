import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, isAuthenticated, clearError, initializeAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Email and Password are required");
      return;
    }
    clearError();
    const result = await login({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    if (!result.success) {
      console.log("Login failed:", result.error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Admin Login
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={clearError} 
              className="text-red-500 underline text-xs mt-1"
            >
              Clear Error
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              disabled={isLoading}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-200"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                      5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 
                      5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
          
        </form>
        
      </div>
    </div>
  );
}
