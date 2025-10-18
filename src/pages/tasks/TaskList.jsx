import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "../../utils/apiConfig";
import toast, { Toaster } from "react-hot-toast";
import { FileText, User } from "lucide-react";

const TaskList = () => {
  const location = useLocation();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [filterDomain, setFilterDomain] = useState("All");
  const [filterPI, setFilterPI] = useState("All"); // All | pi_selected_unsure
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const users = await apiClient.getUsers();
      setApplicants(users || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to fetch tasks");
      setApplicants([]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const hasPISelectedOrUnsure = (app) => {
    const entries = app?.pi?.entries;
    if (!Array.isArray(entries)) return false;
    return entries.some(e => e?.status === "selected" || e?.status === "unsure");
  };

  const hasSubmittedTask = (app) => {
    return !!(app?.task && app.task.fileUrl);
  };

  const domainStatusClasses = {
    selected: "bg-green-50 text-green-700",
    unsure: "bg-yellow-50 text-yellow-700",
    rejected: "bg-red-50 text-red-700",
    default: "bg-gray-50 text-gray-700"
  };

  const getPIEntryForDomain = (app, domainName) => {
    if (!app?.pi?.entries || !Array.isArray(app.pi.entries) || !domainName) return null;
    return app.pi.entries.find(e => String(e.domain).toLowerCase() === String(domainName).toLowerCase()) || null;
  };

  const uniqueDomains = ["All", ...new Set(applicants.flatMap(a => a.domains || []))];

  const getTasksArray = (app) => {
    if (!app) return [];
    // Case A: top-level `tasks` array
    if (Array.isArray(app.tasks) && app.tasks.length) {
      return app.tasks.map(t => ({
        domain: t.domain || (t.domainName || ''),
        url: t.url || t.fileUrl || t.link || null,
        submittedAt: t.submittedAt || t.datetime || t.createdAt || t.updatedAt || null,
        status: t.status || null
      })).filter(t => !!t.url);
    }

    const t = app.task;
    if (!t) return [];
    // Case B: `task.tasks` (some responses store tasks under task.tasks)
    if (Array.isArray(t.tasks) && t.tasks.length) {
      return t.tasks.map(s => ({
        domain: s.domain || s.domainName || '',
        url: s.url || s.fileUrl || s.link || null,
        submittedAt: s.submittedAt || s.datetime || s.createdAt || s.updatedAt || null,
        status: s.status || null
      })).filter(s => !!s.url);
    }
    if (Array.isArray(t.submissions) && t.submissions.length) {
      return t.submissions.map(s => ({
        domain: s.domain || '',
        url: s.url || s.fileUrl || null,
        submittedAt: s.submittedAt || s.datetime || s.createdAt || s.updatedAt || null,
        status: s.status || null
      })).filter(s => !!s.url);
    }

    if (t.fileUrl) {
      return [{
        domain: t.domain || (app.domains && app.domains[0]) || 'Task',
        url: t.fileUrl,
        submittedAt: t.submittedAt || t.datetime || t.createdAt || t.updatedAt || null,
        status: t.status || null
      }];
    }

    return [];
  };

  const getSubmissionDatetime = (applicant, tasks = [], submissions = []) => {
    // 1) look into normalized tasks array (task-level timestamps)
    for (const t of tasks) {
      if (t?.submittedAt) return t.submittedAt;
      if (t?.datetime) return t.datetime;
      if (t?.createdAt) return t.createdAt;
      if (t?.updatedAt) return t.updatedAt;
    }

    // 2) check applicant.task level datetime
    if (applicant?.task) {
      if (applicant.task.datetime) return applicant.task.datetime;
      if (applicant.task.submittedAt) return applicant.task.submittedAt;
      if (applicant.task.createdAt) return applicant.task.createdAt;
      if (applicant.task.updatedAt) return applicant.task.updatedAt;
    }

    // 3) top-level applicant.datetime (as shown in your screenshot)
    if (applicant?.datetime) return applicant.datetime;

    // 4) legacy submissions array
    for (const s of submissions) {
      if (s?.submittedAt) return s.submittedAt;
      if (s?.datetime) return s.datetime;
      if (s?.createdAt) return s.createdAt;
      if (s?.updatedAt) return s.updatedAt;
    }

    return null;
  };

  const filteredApplicants = applicants.filter(app => {
    if (searchTerm && typeof searchTerm === 'string') {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = app.name && app.name.toLowerCase().includes(q);
      const emailMatch = app.email && app.email.toLowerCase().includes(q);
      const libMatch = app.lib_id && String(app.lib_id).toLowerCase().includes(q);
      if (!(nameMatch || emailMatch || libMatch)) return false;
    }
    if (filter === "pending" && !hasPISelectedOrUnsure(app)) return false;
    if (filter === "submitted" && !hasSubmittedTask(app)) return false;

    if (filterDomain !== "All" && !(app.domains && app.domains.includes(filterDomain))) return false;

    if (filterDomain !== "All" && filterPI === "pi_selected_unsure") {
      const entry = getPIEntryForDomain(app, filterDomain);
      if (!entry) return false;
      if (!(entry.status === "selected" || entry.status === "unsure")) return false;
    }

    if (filterDomain === "All" && filterPI === "pi_selected_unsure") {
      const entries = app?.pi?.entries;
      if (!Array.isArray(entries) || !entries.some(e => e && (e.status === "selected" || e.status === "unsure"))) return false;
    }

    return true;
  });

  const stats = React.useMemo(() => {
    const selected = filteredApplicants.filter(app => {
      const entries = app?.pi?.entries;
      if (!Array.isArray(entries)) return false;
      return entries.some(e => e?.status === 'selected');
    }).length;

    const unsure = filteredApplicants.filter(app => {
      const entries = app?.pi?.entries;
      if (!Array.isArray(entries)) return false;
      return entries.some(e => e?.status === 'unsure');
    }).length;

    const taskSubmitted = filteredApplicants.filter(app => !!(app?.task?.fileUrl)).length;

    const totalStudents = selected + unsure;

    return { selected, unsure, taskSubmitted, totalStudents };
  }, [filteredApplicants]);

  const getDomainPiStatus = (app, domainName) => {
    if (!app?.pi?.entries || !Array.isArray(app.pi.entries)) return null;
    const match = app.pi.entries.find(e => String(e.domain).toLowerCase() === String(domainName).toLowerCase());
    return match ? (match.status || null) : null;
  };

  const getTaskSubmissions = (app) => {
    if (!app) return [];
    const t = app.task;
    if (!t) return [];
    if (t.fileUrl) {
      return [{ fileUrl: t.fileUrl, submittedAt: t.submittedAt || t.datetime || null }];
    }
    if (Array.isArray(t.submissions)) {
      return t.submissions
        .map(s => ({
          fileUrl: s.fileUrl || s.url || null,
          submittedAt: s.submittedAt || s.datetime || s.createdAt || null
        }))
        .filter(s => !!s.fileUrl);
    }
    if (Array.isArray(t)) {
      return t.map(s => ({
        fileUrl: s.fileUrl || s.url || null,
        submittedAt: s.submittedAt || s.datetime || s.createdAt || null
      })).filter(s => !!s.fileUrl);
    }
    return [];
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
        Student Task Submissions
      </h1>

      {/* Search bar (top) */}
      <div className="mb-4 sm:mb-6 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, email, or library ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border rounded bg-white"
        />
      </div>

      <div className="mb-4 sm:mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">View</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded bg-white"
          >
            <option value="pending">Pending (PI: selected / unsure)</option>
            <option value="submitted">Submitted (Task link present)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Domain</label>
          <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} className="px-3 py-2 border rounded bg-white">
            {uniqueDomains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">PI Filter</label>
          <select value={filterPI} onChange={(e) => setFilterPI(e.target.value)} className="px-3 py-2 border rounded bg-white">
            <option value="All">All</option>
            <option value="pi_selected_unsure">PI: Selected or Unsure</option>
          </select>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Selected</p>
          <p className="text-2xl font-bold text-green-700">{stats.selected}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Unsure</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.unsure}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Total Students (Selected + Unsure)</p>
          <p className="text-2xl font-bold text-indigo-700">{stats.totalStudents}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Task Submitted</p>
          <p className="text-2xl font-bold text-blue-600">{stats.taskSubmitted}</p>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain(s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task 1</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task 2</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-600">Loading submissions...</td>
                  </tr>
                ) : filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-600">No records found.</td>
                  </tr>
                ) : (
                  filteredApplicants.map(applicant => {
                    const tasks = getTasksArray(applicant); // normalized tasks
                    const submissions = getTaskSubmissions(applicant); // legacy fallback
                    const latestDatetime = getSubmissionDatetime(applicant, tasks, submissions);

                    return (
                      <tr key={applicant.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {applicant.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-2">
                            {(applicant.domains || ['Unspecified']).map((d, i) => {
                              const status = getDomainPiStatus(applicant, d) || getPIEntryForDomain(applicant, d)?.status || null;
                              const cls = status === 'selected' ? domainStatusClasses.selected
                                        : status === 'unsure' ? domainStatusClasses.unsure
                                        : status === 'rejected' ? domainStatusClasses.rejected
                                        : domainStatusClasses.default;
                              const domainTask = tasks.find(t => String(t.domain).toLowerCase() === String(d).toLowerCase());
                              return (
                                <span key={i} className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${cls}`}>
                                  {d}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* Task 1 */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {tasks[0] ? (
                            <div>
                              <a href={tasks[0].url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                {tasks[0].domain || 'Task 1'}
                              </a>
                              {/* Do not display raw URL text */}
                              { (tasks[0].submittedAt || tasks[0].createdAt || tasks[0].datetime || tasks[0].updatedAt) && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(tasks[0].submittedAt || tasks[0].datetime || tasks[0].createdAt || tasks[0].updatedAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>

                        {/* Task 2 */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {tasks[1] ? (
                            <div>
                              <a href={tasks[1].url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                {tasks[1].domain || 'Task 2'}
                              </a>
                              {/* Do not display raw URL text */}
                              { (tasks[1].submittedAt || tasks[1].createdAt || tasks[1].datetime || tasks[1].updatedAt) && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(tasks[1].submittedAt || tasks[1].datetime || tasks[1].createdAt || tasks[1].updatedAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>

                        {/* removed Submitted At column — only Task 1 and Task 2 remain */}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No records found.</p>
          </div>
        ) : (
          filteredApplicants.map(applicant => {
            const tasks = getTasksArray(applicant);
            const submissions = getTaskSubmissions(applicant);
            const latestDatetime = getSubmissionDatetime(applicant, tasks, submissions);

            return (
              <div key={applicant.email} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{applicant.name}</h3>
                    <p className="text-sm text-gray-600">
                      <div className="flex flex-wrap gap-2">
                        {(applicant.domains || ['Unspecified']).map((d, i) => {
                          const status = getDomainPiStatus(applicant, d) || getPIEntryForDomain(applicant, d)?.status || null;
                          const cls = status === 'selected' ? domainStatusClasses.selected
                                    : status === 'unsure' ? domainStatusClasses.unsure
                                    : status === 'rejected' ? domainStatusClasses.rejected
                                    : domainStatusClasses.default;
                          return (
                            <span key={i} className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${cls}`}>
                              {d}
                            </span>
                          );
                        })}
                      </div>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {latestDatetime ? (
                        <>Submitted: {new Date(latestDatetime).toLocaleDateString()} • {new Date(latestDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                      ) : 'No submission'}
                    </p>
                    <p className="text-xs text-gray-500">{applicant.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {tasks.length === 0 ? (
                      <span className="text-gray-400 text-sm">No submission</span>
                    ) : (
                      tasks.map((t, idx) => (
                        <div key={idx} className="text-right">
                          <a href={t.url} target="_blank" rel="noreferrer" className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs mb-1">
                            {t.domain || `View ${idx+1}`}
                          </a>
                          {(t.submittedAt || t.createdAt || t.datetime || t.updatedAt) && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(t.submittedAt || t.datetime || t.createdAt || t.updatedAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskList;
