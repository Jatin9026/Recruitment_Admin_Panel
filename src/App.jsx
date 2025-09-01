import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "sonner";
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

// 🔹 Higher Order Component for Protected Routes
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="applicants/list" element={<ApplicantsList />} />
        <Route path="attendance/check-in" element={<CheckInPage />} />
        <Route path="groups/list" element={<GroupsList />} />
        <Route path="screening" element={<PendingScreening />} />
        <Route path="screening/evaluate/:id" element={<ScreeningEvaluate />} />
        <Route path="interview/domain" element={<DomainInterview />} />
        <Route path="interview/events" element={<Events />} />
        <Route path="interview/graphics" element={<Graphics />} />
        <Route path="interview/cr" element={<Cr />} />
        <Route path="interview/pr" element={<Pr />} />
        <Route path="interview/tech" element={<Tech />} />
        <Route path="slot" element={<ManageSlots />} />
        <Route path="mail/templates" element={<MailTemplate />} />
        <Route path="mail/bulk" element={<BulkMail />} />
        <Route path="tasks/list" element={<TaskList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
