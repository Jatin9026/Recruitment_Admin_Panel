// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import {useAuthStore} from "../../store/authStore";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const { user } = useAuthStore(); 
  const [stats, setStats] = useState({});

  useEffect(() => {

    const dummyStats = {
      applicants: 245,
      slots: 12,
      groups: 18,
      interviews: 43,
      tasks: 27,
      auditLogs: 321,
    };
    setStats(dummyStats);
  }, []);

  const renderStatsForRole = () => {
    switch (user?.role) {
      case "SUPER":
        return (
          <>
            <StatCard label="Applicants" value={stats.applicants} />
            <StatCard label="Slots" value={stats.slots} />
            <StatCard label="Groups" value={stats.groups} />
            <StatCard label="Interviews" value={stats.interviews} />
            <StatCard label="Tasks" value={stats.tasks} />
            <StatCard label="Audit Logs" value={stats.auditLogs} />
          </>
        );

      case "ADMIN":
        return (
          <>
            <StatCard label="Applicants" value={stats.applicants} />
            <StatCard label="Slots" value={stats.slots} />
            <StatCard label="Groups" value={stats.groups} />
            <StatCard label="Tasks" value={stats.tasks} />
          </>
        );

      case "INTERVIEWER":
        return (
          <>
            <StatCard label="Assigned Interviews" value={stats.interviews} />
            <StatCard label="Tasks to Review" value={stats.tasks} />
          </>
        );

      case "PROCTOR":
        return (
          <>
            <StatCard label="Active GD Groups" value={stats.groups} />
            <StatCard label="Applicants in Queue" value={Math.floor(stats.applicants / 10)} />
          </>
        );

      case "MEMBER":
        return (
          <>
            <StatCard label="Applicants Present Today" value={Math.floor(stats.applicants / 5)} />
            <StatCard label="GD Queue Length" value={Math.floor(stats.applicants / 10)} />
          </>
        );

      default:
        return (
          <>
            <StatCard label="Applicants" value={stats.applicants} />
            <StatCard label="Slots" value={stats.slots} />
            <StatCard label="Groups" value={stats.groups} />
            <StatCard label="Interviews" value={stats.interviews} />
            <StatCard label="Tasks" value={stats.tasks} />
            <StatCard label="Audit Logs" value={stats.auditLogs} />
          </>
        );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {renderStatsForRole()}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <Card className="shadow-md rounded-2xl">
    <CardContent className="p-6 flex flex-col items-center justify-center">
      <span className="text-lg font-medium text-gray-600">{label}</span>
      <span className="text-3xl font-bold">{value}</span>
    </CardContent>
  </Card>
);

export default Dashboard;
