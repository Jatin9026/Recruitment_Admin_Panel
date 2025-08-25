import React, { useEffect, useState } from "react";

// Dummy data (simulate DB records)
const dummyTasks = [
  {
    _id: "1",
    applicantId: "A101",
    domain: "GD",
    deadline: "2025-08-20T23:59:59Z",
    submittedAt: null,
    fileUrl: null,
    mailLogId: "M001",
  },
  {
    _id: "2",
    applicantId: "A102",
    domain: "Coding",
    deadline: "2025-08-21T23:59:59Z",
    submittedAt: "2025-08-21T18:30:00Z",
    fileUrl: "https://example.com/submissions/code1.pdf",
    mailLogId: "M002",
  },
  {
    _id: "3",
    applicantId: "A103",
    domain: "HR",
    deadline: "2025-08-22T23:59:59Z",
    submittedAt: null,
    fileUrl: null,
    mailLogId: "M003",
  },
];

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setTasks(dummyTasks);
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch tasks");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks
  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) =>
          filter === "completed" ? t.submittedAt : !t.submittedAt
        );

  // Check if deadline is crossed
  const isOverdue = (deadline, submittedAt) => {
    if (submittedAt) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Student Task Submissions</h1>

      {/* Filter */}
      <div className="mb-4 flex gap-4">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded capitalize ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Applicant ID</th>
              <th className="p-2 border">Domain</th>
              <th className="p-2 border">Deadline</th>
              <th className="p-2 border">Submission</th>
              <th className="p-2 border">File</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Loading tasks...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  No tasks found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task._id}
                  className={
                    task.submittedAt
                      ? "bg-green-50"
                      : isOverdue(task.deadline, task.submittedAt)
                      ? "bg-red-50"
                      : ""
                  }
                >
                  <td className="p-2 border">{task.applicantId}</td>
                  <td className="p-2 border">{task.domain}</td>
                  <td className="p-2 border">
                    {new Date(task.deadline).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    {task.submittedAt
                      ? new Date(task.submittedAt).toLocaleString()
                      : "Not Submitted"}
                  </td>
                  <td className="p-2 border">
                    {task.fileUrl ? (
                      <a
                        href={task.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        View File
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 border font-medium">
                    {task.submittedAt ? (
                      <span className="text-green-600">Completed</span>
                    ) : isOverdue(task.deadline, task.submittedAt) ? (
                      <span className="text-red-600">Overdue</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
