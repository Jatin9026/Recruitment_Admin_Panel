import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import ApplicantsList from "./pages/applicants/ApplicantsList";
import ApplicantDetail from "./pages/applicants/ApplicantDetail";
import CheckInPage from "./pages/attendance/CheckIn";
import GroupsList from "./pages/groups/GroupList";
import GroupEvaluate from "./pages/groups/GroupEvaluate";
import PendingScreening from "./pages/screening/PendingScreening";
import DomainInterview from "./pages/interview/DomainInterview";
import ManageSlots from "./pages/slots/ManageSlots";
import MailTemplate from "./pages/mail/MailTemplate";
import BulkMail from "./pages/mail/BulkMail";
import TaskList from "./pages/tasks/TaskList";
import AuditLog from "./pages/audit/AuditLog";
import Setting from "./pages/settings/Setting";
import ScreeningEvaluate from "./pages/screening/ScreeningEvaluate";
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* Applicants */}
        <Route path="/applicants/list" element={<ApplicantsList />} />
        <Route path="/applicants/detail/:id" element={<ApplicantDetail />} />

        {/* Attendance */}
        <Route path="/attendance/check-in" element={<CheckInPage />} />

        {/* Groups */}
        <Route path="/groups/list" element={<GroupsList />} />
        <Route path="/groups/evaluate/:groupId" element={<GroupEvaluate />} />

        {/* Screening */}
        <Route path="/screening" element={<PendingScreening/>}/>
        <Route path="/screening/evaluate/:id" element={<ScreeningEvaluate />} />

        {/* Domain Interview */}
        <Route path="/interview/domain" element={<DomainInterview />} />

        {/* Slots */}
        <Route path="/slots/manage" element={<ManageSlots />} />

        {/* Mail */}
        <Route path="/mail/templates" element={<MailTemplate />} />
        <Route path="/mail/bulk" element={<BulkMail />} />

        {/* Tasks */}
        <Route path="/tasks/list" element={<TaskList />} />

        {/* Audit */}
        <Route path="/audit/logs" element={<AuditLog />} />

        {/* Settings */}
        <Route path="/settings" element={<Setting />} />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
