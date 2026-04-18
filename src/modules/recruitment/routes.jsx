import React from "react";
import Dashboard from "../../pages/recruitment/dashboard/Dashboard";
import GroupsList from "../../pages/recruitment/groups/GroupList";
import PendingScreening from "../../pages/recruitment/screening/PendingScreening";
import ScreeningEvaluate from "../../pages/recruitment/screening/ScreeningEvaluate";
import DomainInterview from "../../pages/recruitment/interview/DomainInterview";
import Events from "../../pages/recruitment/interview/Events";
import Graphics from "../../pages/recruitment/interview/Graphics";
import Cr from "../../pages/recruitment/interview/Cr";
import Pr from "../../pages/recruitment/interview/Pr";
import Tech from "../../pages/recruitment/interview/Tech";
import MailTemplate from "../../pages/recruitment/mail/MailTemplate";
import BulkMail from "../../pages/recruitment/mail/BulkMail";
import TaskList from "../../pages/recruitment/tasks/TaskList";
import CreateAdmin from "../../pages/recruitment/admin/CreateAdmin";
import AdminProfile from "../../pages/recruitment/admin/AdminProfile";
import AdminLogs from "../../pages/recruitment/admin/AdminLogs";
import AdminList from "../../pages/recruitment/admin/AdminList";
import BulkSlotAssignment from "../../pages/recruitment/slots/BulkSlotAssignment";
import SlotAttendance from "../../pages/recruitment/attendance/SlotAttendance";
import { ROUTE_PERMISSIONS } from "../../utils/rolePermissions";
import { RECRUITMENT_CHILD_PATHS } from "./paths";

export const recruitmentRoutes = [
  {
    index: true,
    allowedRoles: ROUTE_PERMISSIONS.dashboard,
    element: <Dashboard />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.dashboard,
    allowedRoles: ROUTE_PERMISSIONS.dashboard,
    element: <Dashboard />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.slotsBulkAssign,
    allowedRoles: ROUTE_PERMISSIONS.slots,
    element: <BulkSlotAssignment />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.slotsAttendance,
    allowedRoles: ROUTE_PERMISSIONS.attendance,
    element: <SlotAttendance />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.groupsList,
    allowedRoles: ROUTE_PERMISSIONS.groups,
    element: <GroupsList />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.screening,
    allowedRoles: ROUTE_PERMISSIONS.screening,
    element: <PendingScreening />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.screeningEvaluate,
    allowedRoles: ROUTE_PERMISSIONS.screening,
    element: <ScreeningEvaluate />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.interviewDomain,
    allowedRoles: ROUTE_PERMISSIONS.interviews,
    element: <DomainInterview />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.interviewEvents,
    allowedRoles: ROUTE_PERMISSIONS.interviews,
    element: <Events />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.interviewGraphics,
    allowedRoles: ROUTE_PERMISSIONS.interviews,
    element: <Graphics />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.interviewCr,
    allowedRoles: ROUTE_PERMISSIONS.interviews,
    element: <Cr />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.interviewPr,
    allowedRoles: ROUTE_PERMISSIONS.interviews,
    element: <Pr />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.interviewTech,
    allowedRoles: ROUTE_PERMISSIONS.interviews,
    element: <Tech />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.mailTemplates,
    allowedRoles: ROUTE_PERMISSIONS.mailTemplates,
    element: <MailTemplate />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.mailBulk,
    allowedRoles: ROUTE_PERMISSIONS.bulkMail,
    element: <BulkMail />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.tasksList,
    allowedRoles: ROUTE_PERMISSIONS.tasks,
    element: <TaskList />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.adminProfile,
    allowedRoles: ROUTE_PERMISSIONS.dashboard,
    element: <AdminProfile />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.adminCreate,
    allowedRoles: ROUTE_PERMISSIONS.createAdmin,
    element: <CreateAdmin />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.adminList,
    allowedRoles: ROUTE_PERMISSIONS.adminLogs,
    element: <AdminList />,
  },
  {
    path: RECRUITMENT_CHILD_PATHS.adminLogs,
    allowedRoles: ROUTE_PERMISSIONS.adminLogs,
    element: <AdminLogs />,
  },
];
