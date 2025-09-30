import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  UserCheck,
  UserX,
  Award,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  GraduationCap,
  Target
} from 'lucide-react';
import useApplicantStore from '../../store/applicantStore';
import useAuthStore from '../../store/authStore';

const Dashboard = () => {
  const { applicants, fetchApplicants } = useApplicantStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const location = useLocation();

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchApplicants();
      setLoading(false);
      
      // Ensure scroll to top after data is loaded
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    };
    loadData();
  }, [fetchApplicants]);

  useEffect(() => {
    if (applicants.length > 0) {
      calculateStats();
    }
  }, [applicants]);

  const calculateStats = () => {
    const total = applicants.length;
    const gdSelected = applicants.filter(a => a.gd?.status === "selected").length;
    const gdRejected = applicants.filter(a => a.gd?.status === "rejected").length;
    const gdScheduled = applicants.filter(a => a.gd?.status === "scheduled").length;
    const screeningSelected = applicants.filter(a => a.screening?.status === "selected").length;
    const screeningRejected = applicants.filter(a => a.gd?.status === "selected" && a.screening?.status === "rejected").length;
    const piSelected = applicants.filter(a => a.pi?.status === "selected").length;
    const piRejected = applicants.filter(a => a.gd?.status === "selected" && a.screening?.status === "selected" && a.pi?.status === "rejected").length;
    const piUnsure = applicants.filter(a => a.gd?.status === "selected" && a.screening?.status === "selected" && a.pi?.status === "unsure").length;
    
    // Department breakdown
    const deptBreakdown = applicants.reduce((acc, app) => {
      const dept = app.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    // Year breakdown
    const yearBreakdown = applicants.reduce((acc, app) => {
      const year = app.year || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    // Domain breakdown (first preferences)
    const domainFirstPrefBreakdown = applicants.reduce((acc, app) => {
      const domain = app.domain_pref_one?.name || app.domainPrefOne?.name || 'Not Specified';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});

    // Domain breakdown (second preferences)
    const domainSecondPrefBreakdown = applicants.reduce((acc, app) => {
      const domain = app.domain_pref_two?.name || app.domainPrefTwo?.name;
      if (domain) {
        acc[domain] = (acc[domain] || 0) + 1;
      }
      return acc;
    }, {});

    // Combined domain preferences (total interest)
    const domainTotalInterest = applicants.reduce((acc, app) => {
      const firstPref = app.domain_pref_one?.name || app.domainPrefOne?.name;
      const secondPref = app.domain_pref_two?.name || app.domainPrefTwo?.name;
      
      if (firstPref) {
        acc[firstPref] = (acc[firstPref] || 0) + 1;
      }
      if (secondPref && secondPref !== firstPref) {
        acc[secondPref] = (acc[secondPref] || 0) + 1;
      }
      return acc;
    }, {});

    setStats({
      total,
      gdSelected,
      gdRejected,
      gdScheduled,
      screeningSelected,
      screeningRejected,
      piSelected,
      piRejected,
      piUnsure,
      deptBreakdown,
      yearBreakdown,
      domainFirstPrefBreakdown,
      domainSecondPrefBreakdown,
      domainTotalInterest,
      conversionRate: total > 0 ? ((screeningSelected / total) * 100).toFixed(1) : 0,
      gdConversionRate: gdScheduled > 0 ? ((gdSelected / gdScheduled) * 100).toFixed(1) : 0,
      screeningConversionRate: gdSelected > 0 ? ((screeningSelected / gdSelected) * 100).toFixed(1) : 0
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorScheme = "blue", delay = 0 }) => {
    const colorClasses = {
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      orange: { bg: "bg-orange-100", text: "text-orange-600" },
      red: { bg: "bg-red-100", text: "text-red-600" }
    };

    const colors = colorClasses[colorScheme] || colorClasses.blue;

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-300"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-gray-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.3, type: "spring", stiffness: 200 }}
            >
              {loading ? '...' : value}
            </motion.p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                <span>{trendValue}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
      </motion.div>
    );
  };

  const ProcessCard = ({ stage, selected, rejected, absent, scheduled, unsure, total, colorScheme, icon: Icon }) => {
    const pending = total - selected - rejected - (absent || 0) - (scheduled || 0) - (unsure || 0);
    const completionRate = total > 0 ? ((selected + rejected + (absent || 0) + (unsure || 0)) / total * 100).toFixed(1) : 0;
    
    const colorClasses = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", progress: "bg-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600", progress: "bg-green-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", progress: "bg-purple-600" }
    };

    const colors = colorClasses[colorScheme] || colorClasses.blue;
    
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm border p-6"
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{stage}</h3>
          <div className={`p-2 rounded-full ${colors.bg}`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
        </div>
        
        <div className="space-y-3">
          {scheduled > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Scheduled</span>
              <span className="font-medium text-blue-600">{scheduled}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Selected</span>
            <span className="font-medium text-green-600">{selected}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Rejected</span>
            <span className="font-medium text-red-600">{rejected}</span>
          </div>
          {unsure > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unsure</span>
              <span className="font-medium text-purple-600">{unsure}</span>
            </div>
          )}
          {absent > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Absent</span>
              <span className="font-medium text-orange-600">{absent}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pending</span>
            <span className="font-medium text-yellow-600">{pending}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Completion</span>
              <span className="font-bold text-gray-900">{completionRate}%</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${colors.progress}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(completionRate, 100)}%` }}
                transition={{ delay: 0.5, duration: 1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const DepartmentCard = ({ title, data, icon: Icon }) => {
    // Sort data by value in descending order and filter out 'Not Specified' for domain cards
    const sortedData = Object.entries(data)
      .filter(([key, value]) => {
        // Show 'Not Specified' for non-domain cards, hide for domain cards
        if (key === 'Not Specified' && title.toLowerCase().includes('domain')) {
          return false;
        }
        return value > 0;
      })
      .sort(([,a], [,b]) => b - a);

    const totalCount = Object.values(data).reduce((sum, count) => sum + count, 0);

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Total: {totalCount}</p>
          </div>
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sortedData.length > 0 ? sortedData.map(([key, value], index) => {
            const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : 0;
            return (
              <motion.div
                key={key}
                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 truncate block whitespace-break-spaces">{key}</span>
                  <div className="flex items-center mt-1">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <motion.div
                        className="bg-blue-600 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{percentage}%</span>
                  </div>
                </div>
                <span className="font-bold text-gray-900 ml-3">{value}</span>
              </motion.div>
            );
          }) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name || 'Admin'}!
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your recruitment process today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="font-medium text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Applicants"
          value={stats.total || 0}
          icon={Users}
          colorScheme="blue"
          delay={0}
        />
        <StatCard
          title="GD Selected"
          value={stats.gdSelected || 0}
          icon={UserCheck}
          trend="up"
          trendValue={stats.gdConversionRate}
          colorScheme="green"
          delay={0.1}
        />
        <StatCard
          title="Screening Selected"
          value={stats.screeningSelected || 0}
          icon={Award}
          trend="up"
          trendValue={stats.screeningConversionRate}
          colorScheme="purple"
          delay={0.2}
        />
        <StatCard
          title="Selection Rate"
          value={`${stats.conversionRate || 0}%`}
          icon={TrendingUp}
          colorScheme="orange"
          delay={0.3}
        />
      </motion.div>

      {/* Process Overview */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recruitment Process Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProcessCard
            stage="Group Discussion"
            selected={stats.gdSelected || 0}
            rejected={stats.gdRejected || 0}
            scheduled={stats.gdScheduled || 0}
            total={stats.total || 0}
            colorScheme="blue"
            icon={Users}
          />
          <ProcessCard
            stage="Screening Round"
            selected={stats.screeningSelected || 0}
            rejected={stats.screeningRejected || 0}
            total={stats.gdSelected || 0}
            colorScheme="green"
            icon={CheckCircle}
          />
          <ProcessCard
            stage="Personal Interview"
            selected={stats.piSelected || 0}
            rejected={stats.piRejected || 0}
            unsure={stats.piUnsure || 0}
            total={stats.screeningSelected || 0}
            colorScheme="purple"
            icon={Briefcase}
          />
        </div>
      </motion.div>

      {/* Demographics */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Applicant Demographics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DepartmentCard
            title="Department Breakdown"
            data={stats.deptBreakdown || {}}
            icon={GraduationCap}
          />
          <DepartmentCard
            title="Year Breakdown"
            data={stats.yearBreakdown || {}}
            icon={Calendar}
          />
          <DepartmentCard
            title="Domain Interest (Total)"
            data={stats.domainTotalInterest || {}}
            icon={Target}
          />
        </div>
      </motion.div>

      {/* Domain Preferences Detail */}
      <motion.div variants={itemVariants} className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Domain Preference Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepartmentCard
            title="First Preference Domains"
            data={stats.domainFirstPrefBreakdown || {}}
            icon={Award}
          />
          <DepartmentCard
            title="Second Preference Domains"
            data={stats.domainSecondPrefBreakdown || {}}
            icon={Target}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;