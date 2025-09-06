import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "../../utils/apiConfig";
import toast, { Toaster } from "react-hot-toast";

const TaskList = () => {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Note: Replace with actual API endpoint when available
      // const response = await apiClient.getTasks();
      // setTasks(response.data || []);
      
      // For now, show empty state since no real tasks API endpoint exists
      setTasks([]);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to fetch tasks");
      setTasks([]);
    } finally {
      setLoading(false);
      
      // Ensure scroll to top after data is loaded
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

  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) =>
          filter === "completed" ? t.submittedAt : !t.submittedAt
        );

  const isOverdue = (deadline, submittedAt) => {
    if (submittedAt) return false;
    return new Date(deadline) < new Date();
  };

  const getStatusInfo = (task) => {
    if (task.submittedAt) {
      return { text: "Completed", color: "text-green-600", bgColor: "bg-green-50" };
    } else if (isOverdue(task.deadline, task.submittedAt)) {
      return { text: "Overdue", color: "text-red-600", bgColor: "bg-red-50" };
    } else {
      return { text: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
        Student Task Submissions
      </h1>

      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded capitalize text-sm sm:text-base transition-colors ${
              filter === f 
                ? "bg-blue-600 text-white shadow-md" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="hidden md:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-sm font-semibold">Applicant ID</th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-sm font-semibold">Domain</th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-sm font-semibold">Deadline</th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-sm font-semibold">Submission</th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-sm font-semibold">File</th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-600 dark:text-gray-400">
                  Loading tasks...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-600 dark:text-gray-400">
                  No tasks found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const status = getStatusInfo(task);
                return (
                  <tr
                    key={task._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${status.bgColor} dark:${status.bgColor.replace('bg-', 'bg-opacity-20 bg-')}`}
                  >
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm">{task.applicantId}</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm">{task.domain}</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                      {new Date(task.deadline).toLocaleString()}
                    </td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                      {task.submittedAt
                        ? new Date(task.submittedAt).toLocaleString()
                        : "Not Submitted"}
                    </td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                      {task.fileUrl ? (
                        <a
                          href={task.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium">
                      <span className={status.color}>{status.text}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">No tasks found.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const status = getStatusInfo(task);
            return (
              <div
                key={task._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${
                  task.submittedAt
                    ? "border-green-500"
                    : isOverdue(task.deadline, task.submittedAt)
                    ? "border-red-500"
                    : "border-yellow-500"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{task.applicantId}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.domain}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${status.color} ${status.bgColor}`}>
                    {status.text}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                    <span className="font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Submission:</span>
                    <span className="font-medium">
                      {task.submittedAt
                        ? new Date(task.submittedAt).toLocaleDateString()
                        : "Not Submitted"}
                    </span>
                  </div>
                  
                  {task.fileUrl && (
                    <div className="pt-2">
                      <a
                        href={task.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        View File
                      </a>
                    </div>
                  )}
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
