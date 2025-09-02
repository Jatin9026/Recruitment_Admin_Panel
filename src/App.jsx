import React, { useEffect } from 'react';
// ✅ Router यहाँ import करें
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./components/Layout";
import useAuthStore from "./store/authStore";
import { Toaster } from "sonner";

// Page imports
import Dashboard from "./pages/dashboard/Dashboard";
import ApplicantsList from "./pages/applicants/ApplicantsList";
import CheckInPage from "./pages/attendance/CheckIn";
import GroupsList from "./pages/groups/GroupList";
import PendingScreening from "./pages/screening/PendingScreening";
import ScreeningEvaluate from "./pages/screening/ScreeningEvaluate";
import DomainInterview from "./pages/interview/DomainInterview";
import Events from "./pages/interview/Events";
import Graphics from "./pages/interview/Graphics";
import Cr from "./pages/interview/Cr";
import Pr from "./pages/interview/Pr";
import Tech from "./pages/interview/Tech";
import ManageSlots from "./pages/slots/ManageSlots";
import MailTemplate from "./pages/mail/MailTemplate";
import BulkMail from "./pages/mail/BulkMail";
import TaskList from "./pages/tasks/TaskList";
import LoginPage from "./pages/login/Login";

// ==================== PROTECTED ROUTE COMPONENT ====================
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ==================== MAIN APP COMPONENT ====================
function App() {
  
  const { initializeAuth, isAuthenticated } = useAuthStore();

  // ==================== APP INITIALIZATION ====================
  useEffect(() => {
    console.log("🚀 App started, initializing authentication...");
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔧 Auth Status:", { isAuthenticated });
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* ==================== TOAST NOTIFICATIONS ==================== */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={4000}
      />
      
      {/* ✅ केवल यहाँ एक Router है - कहीं और नहीं */}
      <Router>
        <div className="App">
          
          <Routes>
            
            {/* ==================== LOGIN ROUTE ==================== */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage />
                )
              } 
            />

            {/* ==================== PROTECTED ROUTES ==================== */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              
              {/* Dashboard */}
              <Route index element={<Dashboard />} />

              {/* Applicants Management */}
              <Route path="applicants/list" element={<ApplicantsList />} />

              {/* Attendance Management */}
              <Route path="attendance/check-in" element={<CheckInPage />} />

              {/* Groups Management */}
              <Route path="groups/list" element={<GroupsList />} />

              {/* Screening Process */}
              <Route path="screening" element={<PendingScreening />} />
              <Route path="screening/evaluate/:id" element={<ScreeningEvaluate />} />

              {/* Interview Management */}
              <Route path="interview/domain" element={<DomainInterview />} />
              <Route path="interview/events" element={<Events />} />
              <Route path="interview/graphics" element={<Graphics />} />
              <Route path="interview/cr" element={<Cr />} />
              <Route path="interview/pr" element={<Pr />} />
              <Route path="interview/tech" element={<Tech />} />

              {/* Slots Management */}
              <Route path="slot" element={<ManageSlots />} />

              {/* Email Management */}
              <Route path="mail/templates" element={<MailTemplate />} />
              <Route path="mail/bulk" element={<BulkMail />} />

              {/* Task Management */}
              <Route path="tasks/list" element={<TaskList />} />

            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
            
          </Routes>
          
        </div>
      </Router>
    </>
  );
}

export default App;
