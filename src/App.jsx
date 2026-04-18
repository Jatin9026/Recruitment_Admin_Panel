import React, { useEffect, useMemo } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./components/Layout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import IdeatexProtectedRoute from "./components/IdeatexProtectedRoute";
import EndeavourProtectedRoute from "./components/EndeavourProtectedRoute";
import useAuthStore from "./store/authStore";
import { useIdeatexAuthStore } from "./store/ideatexAuthStore";
import { useEndeavourAuthStore } from "./store/endeavourAuthStore";
import { ROUTE_PERMISSIONS } from "./utils/rolePermissions";
import { Toaster, toast } from "sonner";
import ControlCenter from "./pages/control-center/ControlCenter";
import { RECRUITMENT_PATHS } from "./modules/recruitment/paths";
import { IDEATEX_PATHS } from "./modules/ideatex/paths";

// Page imports
import Dashboard from "./pages/recruitment/dashboard/Dashboard";
// import CheckInPage from "./pages/attendance/CheckIn";
import GroupsList from "./pages/recruitment/groups/GroupList";
import PendingScreening from "./pages/recruitment/screening/PendingScreening";
import ScreeningEvaluate from "./pages/recruitment/screening/ScreeningEvaluate";
import DomainInterview from "./pages/recruitment/interview/DomainInterview";
import Events from "./pages/recruitment/interview/Events";
import Graphics from "./pages/recruitment/interview/Graphics";
import Cr from "./pages/recruitment/interview/Cr";
import Pr from "./pages/recruitment/interview/Pr";
import Tech from "./pages/recruitment/interview/Tech";
// import ManageSlots from "./pages/slots/ManageSlots";
import MailTemplate from "./pages/recruitment/mail/MailTemplate";
import BulkMail from "./pages/recruitment/mail/BulkMail";
import TaskList from "./pages/recruitment/tasks/TaskList";
import CreateAdmin from "./pages/recruitment/admin/CreateAdmin";
import AdminProfile from "./pages/recruitment/admin/AdminProfile";
import AdminLogs from "./pages/recruitment/admin/AdminLogs";
import AdminList from "./pages/recruitment/admin/AdminList";
import RecruitmentLogin from "./pages/recruitment/login/RecruitmentLogin";
import BulkSlotAssignment from './pages/recruitment/slots/BulkSlotAssignment';
import SlotAttendance from './pages/recruitment/attendance/SlotAttendance';

// Ideatex page imports
import IdeatexDashboard from "./pages/ideatex/Dashboard";
import TeamList from "./pages/ideatex/TeamList";
import CoordinatorList from "./pages/ideatex/CoordinatorList";
import PanelAssignment from "./pages/ideatex/PanelAssignment";
import IdeatexSettings from "./pages/ideatex/Settings";
import IdeatexLogin from "./pages/ideatex/login/IdeatexLogin";
import EndeavourLogin from "./pages/endeavour/login/Login";
import { endeavourRoutes } from "./modules/endeavour/routes";

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

  return isAuthenticated ? children : <Navigate to={RECRUITMENT_PATHS.login} replace />;
}

// ==================== MAIN APP COMPONENT ====================
function App() {
  
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const ideatexIsAuthenticated = useIdeatexAuthStore((state) => state.isAuthenticated);
  const ideatexIsInitialized = useIdeatexAuthStore((state) => state.isInitialized);
  
  // Ideatex auth store
  const initializeIdeatexAuth = useIdeatexAuthStore((state) => state.initializeAuth);
  const initializeEndeavourAuth = useEndeavourAuthStore((state) => state.initializeAuth);

  // ==================== APP INITIALIZATION ====================
  useEffect(() => {
    console.log("🚀 App started, initializing authentication...");
    
    // Set up global toast callback for token refresh notifications
    window.showToast = (message, options = {}) => {
      const { type = 'info', duration = 3000 } = options;
      
      switch (type) {
        case 'loading':
          return toast.loading(message, { duration });
        case 'success':
          return toast.success(message, { duration });
        case 'error':
          return toast.error(message, { duration });
        case 'info':
        default:
          return toast.info(message, { duration });
      }
    };

    // Set up global dismiss function for toast notifications
    window.dismissToast = (toastId) => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
    
    // Initialize both auth stores
    initializeAuth();
    initializeIdeatexAuth();
    initializeEndeavourAuth();
    
    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        delete window.showToast;
        delete window.dismissToast;
      }
    };
  }, [initializeAuth, initializeIdeatexAuth, initializeEndeavourAuth]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔧 Auth Status:", { isAuthenticated, isInitialized });
    }
  }, [isAuthenticated, isInitialized]);

  const loadingScreen = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading....</p>
      </div>
    </div>
  );

  // Memoize login route element to prevent re-creation
  const loginRouteElement = useMemo(() => {
    if (!isInitialized) {
      return loadingScreen;
    }
    
    return isAuthenticated ? <Navigate to={RECRUITMENT_PATHS.root} replace /> : <RecruitmentLogin />;
  }, [isInitialized, isAuthenticated]);

  const ideatexLoginRouteElement = useMemo(() => {
    if (!ideatexIsInitialized) {
      return loadingScreen;
    }

    return ideatexIsAuthenticated ? <Navigate to={IDEATEX_PATHS.root} replace /> : <IdeatexLogin />;
  }, [ideatexIsInitialized, ideatexIsAuthenticated]);

  return (
    <>
      {/* ==================== TOAST NOTIFICATIONS ==================== */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={5000}
      />
      
      <Router>
        <div className="App">
          
          <Routes>

            {/* ==================== CONTROL CENTER ==================== */}
            <Route path="/" element={<ControlCenter />} />
            
            {/* ==================== LOGIN ROUTE ==================== */}
            <Route 
              path={RECRUITMENT_PATHS.login}
              element={loginRouteElement} 
            />
            <Route path="/login" element={<Navigate to={RECRUITMENT_PATHS.login} replace />} />
            <Route path={IDEATEX_PATHS.login} element={ideatexLoginRouteElement} />

            {/* ==================== PROTECTED ROUTES ==================== */}
            <Route
              path={RECRUITMENT_PATHS.root}
              element={
                <ProtectedRoute>
                  <Layout moduleType="recruitment" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="dashboard" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.dashboard}>
                  <Dashboard />
                </RoleProtectedRoute>
              } />

              {/* Slots Management */}
              <Route path="slots/bulk-assign" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.slots}>
                  <BulkSlotAssignment />
                </RoleProtectedRoute>
              } />

              {/* Slots Attendance */}
              <Route path="slots/attendance" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.attendance}>
                  <SlotAttendance />
                </RoleProtectedRoute>
              } />

              {/* Applicants Management */}
              {/* <Route path="applicants/list" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.applicants}>
                  <ApplicantsList />
                </RoleProtectedRoute>
              } /> */}

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
              <Route path="admin/profile" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.dashboard}>
                  <AdminProfile />
                </RoleProtectedRoute>
              } />
              <Route path="admin/create" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.createAdmin}>
                  <CreateAdmin />
                </RoleProtectedRoute>
              } />
              <Route path="admin/list" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.adminLogs}>
                  <AdminList />
                </RoleProtectedRoute>
              } />
              <Route path="admin/logs" element={
                <RoleProtectedRoute allowedRoles={ROUTE_PERMISSIONS.adminLogs}>
                  <AdminLogs />
                </RoleProtectedRoute>
              } />

            </Route>

            {/* ==================== IDEATEX ROUTES ==================== */}
            <Route
              path="/ideatex"
              element={
                <IdeatexProtectedRoute>
                  <Layout moduleType="ideatex" />
                </IdeatexProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/ideatex/dashboard" replace />} />
              <Route path="dashboard" element={<IdeatexDashboard />} />
              <Route path="teams" element={<TeamList />} />
              <Route path="coordinators" element={<CoordinatorList />} />
              <Route path="panel-assignment" element={<PanelAssignment />} />
              <Route path="settings" element={<IdeatexSettings />} />
            </Route>

            {/* ==================== ENDEAVOUR ROUTES ==================== */}
            <Route path="/endeavour/login" element={<EndeavourLogin />} />

            <Route
              path="/endeavour"
              element={
                <EndeavourProtectedRoute>
                  <Layout moduleType="endeavour" />
                </EndeavourProtectedRoute>
              }
            >
              {endeavourRoutes.map((route) => (
                <Route
                  key={route.path || "endeavour-index"}
                  index={route.index}
                  path={route.path}
                  element={route.element}
                />
              ))}
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
