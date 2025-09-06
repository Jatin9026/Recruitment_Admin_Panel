import React, { useEffect, useMemo } from 'react';
// ✅ Router यहाँ import करें
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./components/Layout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import useAuthStore from "./store/authStore";
import { ROUTE_PERMISSIONS } from "./utils/rolePermissions";
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
import CreateAdmin from "./pages/admin/CreateAdmin";
import LoginPage from "./pages/login/Login";

// ==================== PROTECTED ROUTE COMPONENT ====================
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ==================== MAIN APP COMPONENT ====================
function App() {
  
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // ==================== APP INITIALIZATION ====================
  useEffect(() => {
    console.log("🚀 App started, initializing authentication...");
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔧 Auth Status:", { isAuthenticated, isInitialized });
    }
  }, [isAuthenticated, isInitialized]);

  // Memoize login route element to prevent re-creation
  const loginRouteElement = useMemo(() => {
    if (!isInitialized) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading....</p>
          </div>
        </div>
      );
    }
    
    return isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />;
  }, [isInitialized, isAuthenticated]);

  return (
    <>
      {/* ==================== TOAST NOTIFICATIONS ==================== */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={5000}
      />
      
      {/* ✅ केवल यहाँ एक Router है - कहीं और नहीं */}
      <Router>
        <div className="App">
          
          <Routes>
            
            {/* ==================== LOGIN ROUTE ==================== */}
            <Route 
              path="/login" 
              element={loginRouteElement} 
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
              <Route index element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.dashboard}>
                  <Dashboard />
                </RoleProtectedRoute>
              } />

              {/* Applicants Management */}
              <Route path="applicants/list" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.applicants}>
                  <ApplicantsList />
                </RoleProtectedRoute>
              } />

              {/* Attendance Management */}
              {/* <Route path="attendance/check-in" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.attendance}>
                  <CheckInPage />
                </RoleProtectedRoute>
              } /> */}

              {/* Groups Management */}
              <Route path="groups/list" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.groups}>
                  <GroupsList />
                </RoleProtectedRoute>
              } />

              {/* Screening Process */}
              <Route path="screening" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.screening}>
                  <PendingScreening />
                </RoleProtectedRoute>
              } />
              <Route path="screening/evaluate/:id" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.screening}>
                  <ScreeningEvaluate />
                </RoleProtectedRoute>
              } />

              {/* Interview Management */}
              <Route path="interview/domain" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.interviews}>
                  <DomainInterview />
                </RoleProtectedRoute>
              } />
              <Route path="interview/events" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.interviews}>
                  <Events />
                </RoleProtectedRoute>
              } />
              <Route path="interview/graphics" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.interviews}>
                  <Graphics />
                </RoleProtectedRoute>
              } />
              <Route path="interview/cr" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.interviews}>
                  <Cr />
                </RoleProtectedRoute>
              } />
              <Route path="interview/pr" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.interviews}>
                  <Pr />
                </RoleProtectedRoute>
              } />
              <Route path="interview/tech" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.interviews}>
                  <Tech />
                </RoleProtectedRoute>
              } />

              {/* Slots Management */}
              {/* <Route path="slot" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.slots}>
                  <ManageSlots />
                </RoleProtectedRoute>
              } /> */}

              {/* Email Management */}
              <Route path="mail/templates" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.mailTemplates}>
                  <MailTemplate />
                </RoleProtectedRoute>
              } />
              <Route path="mail/bulk" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.bulkMail}>
                  <BulkMail />
                </RoleProtectedRoute>
              } />

              {/* Task Management */}
              <Route path="tasks/list" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.tasks}>
                  <TaskList />
                </RoleProtectedRoute>
              } />

              {/* Admin Management */}
              <Route path="admin/create" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.createAdmin}>
                  <CreateAdmin />
                </RoleProtectedRoute>
              } />

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
