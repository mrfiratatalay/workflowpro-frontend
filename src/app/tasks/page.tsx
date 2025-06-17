"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  isAuthenticated,
  removeToken,
  fetchWithAuth,
} from "@/utils/auth";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  project_id: number | null;
  due_date: string | null;
  assigned_user_id: number;
  created_at: string;
  updated_at: string | null;
}

interface TaskForm {
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
}

export default function Tasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const userData = await getCurrentUser();
      if (!userData) {
        removeToken();
        router.push("/login");
        return;
      }

      await fetchTasks();
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8000/tasks");
      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        ...taskForm,
        due_date: taskForm.due_date || null,
      };

      const response = await fetchWithAuth("http://localhost:8000/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        await fetchTasks();
        setShowCreateForm(false);
        setTaskForm({
          title: "",
          description: "",
          status: "pending",
          priority: "medium",
          due_date: "",
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const taskData = {
        ...taskForm,
        due_date: taskForm.due_date || null,
      };

      const response = await fetchWithAuth(
        `http://localhost:8000/tasks/${editingTask.id}`,
        {
          method: "PUT",
          body: JSON.stringify(taskData),
        }
      );

      if (response.ok) {
        await fetchTasks();
        setEditingTask(null);
        setTaskForm({
          title: "",
          description: "",
          status: "pending",
          priority: "medium",
          due_date: "",
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8000/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      due_date: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Task Management
            </h1>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800"
              >
                Dashboard
              </a>
              <a href="/projects" className="text-blue-600 hover:text-blue-800">
                Projects
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Create New Task
              </button>
            </div>

            {/* Create/Edit Task Form */}
            {(showCreateForm || editingTask) && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingTask ? "Edit Task" : "Create New Task"}
                </h2>
                <form
                  onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={taskForm.title}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, title: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={taskForm.due_date}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, due_date: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={taskForm.status}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, status: e.target.value })
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={taskForm.priority}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, priority: e.target.value })
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={taskForm.description}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      {editingTask ? "Update Task" : "Create Task"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        cancelEdit();
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tasks List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  Your Tasks ({tasks.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {tasks.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No tasks yet. Create your first task!
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {task.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status.replace("_", " ")}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              Created:{" "}
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                            {task.due_date && (
                              <span>
                                Due:{" "}
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(task)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
