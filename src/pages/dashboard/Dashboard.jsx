
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({});

  useEffect(() => {
    const dummyStats = {
      applicants: 245,
      presentToday: 190,
      absentToday: 55,
      groups: 18,
      activeGroups: 12,
      completedGroups: 6,
      interviews: 43,
      interviewsDone: 30,
      interviewsPending: 13,
      tasks: 27,
      tasksReviewed: 15,
      tasksPending: 12,
    };

    setStats(dummyStats);
  }, []);

  const renderStatsForRole = () => {
    switch (user?.role) {
      case "SUPER":
        return (
          <>
            <StatCard label="Total Applicants" value={stats.applicants} />
            <StatCard label="Present Today" value={stats.presentToday} />
            <StatCard label="Absent Today" value={stats.absentToday} />
            <StatCard label="Groups (Active)" value={stats.activeGroups} />
            <StatCard label="Groups (Completed)" value={stats.completedGroups} />
            <StatCard label="Interviews (Total)" value={stats.interviews} />
            <StatCard label="Interviews Done" value={stats.interviewsDone} />
            <StatCard label="Pending Interviews" value={stats.interviewsPending} />
            <StatCard label="Tasks (Total)" value={stats.tasks} />
            <StatCard label="Reviewed Tasks" value={stats.tasksReviewed} />
            <StatCard label="Pending Tasks" value={stats.tasksPending} />
          </>
        );
      case "ADMIN":
        return (
          <>
            <StatCard label="Applicants" value={stats.applicants} />
            <StatCard label="Present Today" value={stats.presentToday} />
            <StatCard label="Groups" value={stats.groups} />
            <StatCard label="Tasks" value={stats.tasks} />
          </>
        );
      case "INTERVIEWER":
        return (
          <>
            <StatCard label="Assigned Interviews" value={stats.interviews} />
            <StatCard label="Interviews Done" value={stats.interviewsDone} />
            <StatCard label="Pending Interviews" value={stats.interviewsPending} />
            <StatCard label="Tasks to Review" value={stats.tasksPending} />
          </>
        );
      case "PROCTOR":
        return (
          <>
            <StatCard label="Active GD Groups" value={stats.activeGroups} />
            <StatCard label="Completed Groups" value={stats.completedGroups} />
            <StatCard label="Applicants in Queue" value={Math.floor(stats.applicants / 10)} />
          </>
        );
      case "MEMBER":
        return (
          <>
            <StatCard label="Applicants Present Today" value={stats.presentToday} />
            <StatCard label="GD Queue Length" value={Math.floor(stats.applicants / 10)} />
            <StatCard label="Pending Tasks" value={stats.tasksPending} />
          </>
        );
      default:
        return (
          <>
            <StatCard label="Applicants" value={stats.applicants} />
            <StatCard label="Groups" value={stats.groups} />
            <StatCard label="Interviews" value={stats.interviews} />
            <StatCard label="Tasks" value={stats.tasks} />
          </>
        );
    }
  };

  return (
    <div className="p-6 space-y-10 overflow-hidden">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {renderStatsForRole()}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <Card className="shadow-md rounded-2xl bg-white hover:shadow-lg transition-shadow">
    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </CardContent>
  </Card>
);

export default Dashboard;
