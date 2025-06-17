"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  isAuthenticated,
  removeToken,
  User,
  fetchWithAuth,
} from "@/utils/auth";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  due_date: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const userData = await getCurrentUser();
      if (!userData) {
        // Token might be invalid, redirect to login
        removeToken();
        router.push("/login");
        return;
      }

      setUser(userData);
      await fetchTasks();
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8000/tasks?limit=5"
      );
      if (response.ok) {
        const tasks: Task[] = await response.json();
        setRecentTasks(tasks);

        // Calculate stats
        const stats = {
          total: tasks.length,
          pending: tasks.filter((t) => t.status === "pending").length,
          in_progress: tasks.filter((t) => t.status === "in_progress").length,
          completed: tasks.filter((t) => t.status === "completed").length,
        };
        setTaskStats(stats);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Welcome, {user.full_name || user.username}!
                </div>
              )}
              <a
                href="/reports"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
              >
                <span>📊</span>
                <span>Analytics</span>
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
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-500 bg-opacity-75">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        ></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Tasks
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {taskStats.total}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-500 bg-opacity-75">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Pending
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {taskStats.pending}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-500 bg-opacity-75">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        In Progress
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {taskStats.in_progress}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-500 bg-opacity-75">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Completed
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {taskStats.completed}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Recent Tasks</h2>
                  <a
                    href="/tasks"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Tasks →
                  </a>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentTasks.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No tasks
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating your first task.
                      </p>
                      <div className="mt-6">
                        <a
                          href="/tasks"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Create Task
                        </a>
                      </div>
                    </div>
                  ) : (
                    recentTasks.map((task) => (
                      <div key={task.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {task.title}
                            </h3>
                            <div className="mt-1 flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  task.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : task.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : task.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {task.status.replace("_", " ")}
                              </span>
                              <span className="text-xs text-gray-500">
                                Created{" "}
                                {new Date(task.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <a
                            href="/tasks"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
