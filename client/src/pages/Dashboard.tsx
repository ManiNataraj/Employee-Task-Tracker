import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import type { Task } from "../types/task";
import Toast, { type ToastMessage } from "../components/Toast";


const API = import.meta.env.VITE_API_URL;

// ── helpers ──────────────────────────────────────────────────────────────────

const priorityConfig: Record<string, { badge: string; dot: string }> = {
  High: {
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
    dot: "bg-rose-500",
  },
  Medium: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  Low: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-400",
  },
};

function formatDueDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDueDateStatus(dateStr: string | undefined, isDone: boolean) {
  if (!dateStr || isDone) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0)
    return {
      label: "Overdue",
      cls: "bg-rose-50 text-rose-700 border border-rose-200",
    };
  if (diffDays === 0)
    return {
      label: "Due today",
      cls: "bg-amber-50 text-amber-700 border border-amber-200",
    };
  if (diffDays <= 2)
    return {
      label: `${diffDays}d left`,
      cls: "bg-orange-50 text-orange-700 border border-orange-200",
    };
  return {
    label: formatDueDate(dateStr),
    cls: "bg-gray-50 text-gray-500 border border-gray-200",
  };
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState<string>("");
  const [priority, setPriority] = useState<string>("Low");
  const [dueDate, setDueDate] = useState<string>("");
  const [filter, setFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [editDue, setEditDue] = useState<string>("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastMessage["type"]) => {
    toastIdRef.current += 1;
    setToasts((prev) => [...prev, { id: toastIdRef.current, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/tasks`);
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!taskName.trim()) return;
    try {
      await axios.post(`${API}/tasks`, {
        taskName,
        priority,
        status: "Pending",
        dueDate: dueDate || null,
      });
      setTaskName("");
      setDueDate("");
      await fetchTasks();
      addToast("Task created successfully", "success");
    } catch {
      addToast("Failed to create task", "error");
    }
  };

  const completeTask = async (id: number) => {
    try {
      await axios.put(`${API}/tasks/${id}`, {
        status: "Completed",
      });
      await fetchTasks();
      addToast("Task marked as completed", "success");
    } catch {
      addToast("Failed to complete task", "error");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`${API}/tasks/${id}`);
      await fetchTasks();
      addToast("Task deleted successfully", "success");
    } catch {
      addToast("Failed to delete task", "error");
    }
  };

  const updateTask = async (id: number) => {
    try {
      await axios.put(`${API}/tasks/${id}`, {
        taskName: editText,
        dueDate: editDue || null,
      });
      setEditingId(null);
      setEditText("");
      setEditDue("");
      await fetchTasks();
      addToast("Task updated successfully", "success");
    } catch {
      addToast("Failed to update task", "error");
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.taskName);
    setEditDue(task.dueDate ?? "");
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filter === "Completed"
        ? task.status === "Completed"
        : filter === "Pending"
          ? task.status === "Pending"
          : true;
    const priorityMatch =
      priorityFilter === "All" || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === "Completed") return false;
    return new Date(t.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  }).length;
  const progress =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // shared input class
  const inputCls =
    "px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Toast Container ── */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 w-72 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* ── Header ── */}
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 11l3 3L22 4"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Task Manager
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">
            Track and manage your work efficiently
          </p>
        </div>

        {/* ── Stats ── */}
        {tasks.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Total
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {tasks.length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Pending
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-500">
                  {pendingCount}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Done
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-500">
                  {completedCount}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Overdue
                </p>
                <p
                  className={`text-2xl sm:text-3xl font-bold ${overdueCount > 0 ? "text-rose-500" : "text-gray-300"}`}
                >
                  {overdueCount}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Progress
                </p>
                <span className="text-sm font-bold text-gray-900">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-gray-400">
                  {completedCount} completed
                </span>
                <span className="text-[10px] text-gray-400">
                  {tasks.length} total
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Task Panel ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 mb-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Add New Task
          </p>
          <div className="flex flex-col gap-2">
            {/* Row 1 */}
            <input
              type="text"
              placeholder="What needs to be done?"
              className={`w-full ${inputCls}`}
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            {/* Row 2: priority + due date + button */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className={`flex-1 ${inputCls} cursor-pointer`}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M16 2v4M8 2v4M3 10h18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="date"
                  className={`w-full pl-9 ${inputCls}`}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <button
                onClick={addTask}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 shadow-sm space-y-3">
          {/* Row 1: Status filter + result count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest hidden sm:inline">
                Status
              </span>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
                {["All", "Pending", "Completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                      filter === f
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {f}
                    {f === "All" && tasks.length > 0 && (
                      <span
                        className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${filter === "All" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}
                      >
                        {tasks.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs sm:text-sm text-gray-400 pl-1 sm:pl-0">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Row 2: Priority filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Priority
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {/* All priorities */}
              <button
                onClick={() => setPriorityFilter("All")}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  priorityFilter === "All"
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                }`}
              >
                All
              </button>
              {/* High */}
              <button
                onClick={() => setPriorityFilter("High")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  priorityFilter === "High"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${priorityFilter === "High" ? "bg-white" : "bg-rose-500"}`}
                />
                High
                <span
                  className={`text-[10px] font-semibold px-1 py-0.5 rounded-full ${priorityFilter === "High" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-600"}`}
                >
                  {tasks.filter((t) => t.priority === "High").length}
                </span>
              </button>
              {/* Medium */}
              <button
                onClick={() => setPriorityFilter("Medium")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  priorityFilter === "Medium"
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${priorityFilter === "Medium" ? "bg-white" : "bg-amber-400"}`}
                />
                Medium
                <span
                  className={`text-[10px] font-semibold px-1 py-0.5 rounded-full ${priorityFilter === "Medium" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600"}`}
                >
                  {tasks.filter((t) => t.priority === "Medium").length}
                </span>
              </button>
              {/* Low */}
              <button
                onClick={() => setPriorityFilter("Low")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  priorityFilter === "Low"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${priorityFilter === "Low" ? "bg-white" : "bg-emerald-400"}`}
                />
                Low
                <span
                  className={`text-[10px] font-semibold px-1 py-0.5 rounded-full ${priorityFilter === "Low" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"}`}
                >
                  {tasks.filter((t) => t.priority === "Low").length}
                </span>
              </button>
            </div>
            {/* Clear filters chip — shown only when filters are active */}
            {(filter !== "All" || priorityFilter !== "All") && (
              <button
                onClick={() => {
                  setFilter("All");
                  setPriorityFilter("All");
                }}
                className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs text-gray-400 border border-dashed border-gray-300 rounded-full hover:border-gray-400 hover:text-gray-600 transition-all"
              >
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Task List ── */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 24 24"
              className="mb-3 opacity-30"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 12h8M8 8h8M8 16h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-base font-medium">No tasks here</p>
            <p className="text-sm mt-1">
              {filter === "All" && priorityFilter === "All"
                ? "Add your first task above"
                : `No ${priorityFilter !== "All" ? priorityFilter + " priority " : ""}${filter !== "All" ? filter.toLowerCase() + " " : ""}tasks`}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
              const pc = priorityConfig[task.priority] || priorityConfig["Low"];
              const isDone = task.status === "Completed";
              const dueMeta = getDueDateStatus(task.dueDate, isDone);
              const isOverdue = dueMeta?.label === "Overdue";

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                    isOverdue
                      ? "border-rose-200 bg-rose-50/30"
                      : isDone
                        ? "border-gray-100 bg-gray-50/50"
                        : "border-gray-200"
                  }`}
                >
                  {/* Top: checkbox + title */}
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-colors ${isDone ? "bg-emerald-500" : "border-2 border-gray-300 bg-white"}`}
                    >
                      {isDone && (
                        <svg
                          width="11"
                          height="11"
                          fill="none"
                          viewBox="0 0 12 12"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {editingId === task.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && updateTask(task.id)
                        }
                        className={`flex-1 ${inputCls}`}
                        autoFocus
                      />
                    ) : (
                      <h2
                        className={`flex-1 text-sm font-semibold leading-snug break-words ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}
                      >
                        {task.taskName}
                      </h2>
                    )}
                  </div>

                  {/* Edit due date row (only while editing) */}
                  {editingId === task.id && (
                    <div className="ml-7 mb-2.5 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg
                          width="13"
                          height="13"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M16 2v4M8 2v4M3 10h18"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <input
                        type="date"
                        value={editDue}
                        onChange={(e) => setEditDue(e.target.value)}
                        className={`w-full pl-9 ${inputCls} text-xs`}
                      />
                    </div>
                  )}

                  {/* Bottom: badges + due date + actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 ml-7">
                    {/* Left: badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Priority */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${pc.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${pc.dot}`}
                        />
                        {task.priority}
                      </span>
                      {/* Status */}
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${isDone ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
                      >
                        {task.status}
                      </span>
                      {/* Due date badge */}
                      {dueMeta && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${dueMeta.cls}`}
                        >
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M16 2v4M8 2v4M3 10h18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          {dueMeta.label}
                        </span>
                      )}
                      {/* No due date at all — show placeholder */}
                      {!task.dueDate && editingId !== task.id && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-300 px-2.5 py-1 rounded-full border border-dashed border-gray-200">
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M16 2v4M8 2v4M3 10h18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          No due date
                        </span>
                      )}
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-1.5">
                      {editingId === task.id ? (
                        <button
                          onClick={() => updateTask(task.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(task)}
                          className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => completeTask(task.id)}
                        disabled={isDone}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${isDone ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"}`}
                      >
                        {isDone ? "Done" : "Complete"}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                        aria-label="Delete task"
                      >
                        <svg
                          width="13"
                          height="13"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
