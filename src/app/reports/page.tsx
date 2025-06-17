"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, isAuthenticated } from "../../utils/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface SystemOverview {
  total_users: number;
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
  completion_rate: number;
}

interface UserStats {
  user_id: number;
  user_name: string;
  user_email: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  cancelled_tasks: number;
  completion_rate: number;
}

interface ProjectStats {
  project_id: number;
  project_name: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  cancelled_tasks: number;
  completion_rate: number;
  team_size: number;
}

interface TaskDistribution {
  priority?: string;
  status?: string;
  count: number;
}

interface ReportsData {
  system_overview: SystemOverview;
  user_stats: UserStats[];
  project_stats: ProjectStats[];
  task_priority_distribution: TaskDistribution[];
  task_status_distribution: TaskDistribution[];
  recent_activity_count: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchReportsData();
  }, [router]);

  const fetchReportsData = async () => {
    try {
      const response = await fetch("http://localhost:8000/reports", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartColors = () => ({
    primary: "rgba(59, 130, 246, 0.8)",
    secondary: "rgba(16, 185, 129, 0.8)",
    warning: "rgba(245, 158, 11, 0.8)",
    danger: "rgba(239, 68, 68, 0.8)",
    info: "rgba(139, 92, 246, 0.8)",
    light: "rgba(156, 163, 175, 0.8)",
  });

  const getUserTasksChart = () => {
    if (!reportsData?.user_stats) return null;

    const topUsers = reportsData.user_stats
      .sort((a, b) => b.total_tasks - a.total_tasks)
      .slice(0, 10);

    return {
      labels: topUsers.map((user) => user.user_name),
      datasets: [
        {
          label: "Total Tasks",
          data: topUsers.map((user) => user.total_tasks),
          backgroundColor: getChartColors().primary,
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Completed",
          data: topUsers.map((user) => user.completed_tasks),
          backgroundColor: getChartColors().secondary,
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const getProjectPerformanceChart = () => {
    if (!reportsData?.project_stats) return null;

    const topProjects = reportsData.project_stats
      .sort((a, b) => b.total_tasks - a.total_tasks)
      .slice(0, 8);

    return {
      labels: topProjects.map((project) => project.project_name),
      datasets: [
        {
          label: "Total Tasks",
          data: topProjects.map((project) => project.total_tasks),
          backgroundColor: getChartColors().info,
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Team Size",
          data: topProjects.map((project) => project.team_size),
          backgroundColor: getChartColors().warning,
          borderColor: "rgba(245, 158, 11, 1)",
          borderWidth: 1,
          yAxisID: "y1",
        },
      ],
    };
  };

  const getTaskStatusChart = () => {
    if (!reportsData?.task_status_distribution) return null;

    const colors = [
      getChartColors().warning, // pending
      getChartColors().info, // in_progress
      getChartColors().secondary, // completed
      getChartColors().danger, // cancelled
    ];

    return {
      labels: reportsData.task_status_distribution.map(
        (item) => item.status?.replace("_", " ").toUpperCase() || ""
      ),
      datasets: [
        {
          data: reportsData.task_status_distribution.map((item) => item.count),
          backgroundColor: colors,
          borderColor: colors.map((color) => color.replace("0.8", "1")),
          borderWidth: 2,
        },
      ],
    };
  };

  const getTaskPriorityChart = () => {
    if (!reportsData?.task_priority_distribution) return null;

    const colors = [
      getChartColors().light, // low
      getChartColors().primary, // medium
      getChartColors().warning, // high
      getChartColors().danger, // urgent
    ];

    return {
      labels: reportsData.task_priority_distribution.map(
        (item) => item.priority?.toUpperCase() || ""
      ),
      datasets: [
        {
          data: reportsData.task_priority_distribution.map(
            (item) => item.count
          ),
          backgroundColor: colors,
          borderColor: colors.map((color) => color.replace("0.8", "1")),
          borderWidth: 2,
        },
      ],
    };
  };

  const getCompletionRateChart = () => {
    if (!reportsData?.user_stats) return null;

    const topPerformers = reportsData.user_stats
      .filter((user) => user.total_tasks > 0)
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 8);

    return {
      labels: topPerformers.map((user) => user.user_name),
      datasets: [
        {
          label: "Completion Rate (%)",
          data: topPerformers.map((user) => user.completion_rate),
          borderColor: getChartColors().secondary,
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load reports
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading the analytics data
          </p>
          <button
            onClick={fetchReportsData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-gray-600">
                Monitor performance and track productivity
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={fetchReportsData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportsData.system_overview.total_users}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📁</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportsData.system_overview.total_projects}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Completed Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportsData.system_overview.completed_tasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚡</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportsData.system_overview.active_tasks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate and Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Overall Completion Rate
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-300"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={`${reportsData.system_overview.completion_rate}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {reportsData.system_overview.completion_rate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recent Activity (7 days)</span>
                <span className="font-semibold text-blue-600">
                  {reportsData.recent_activity_count} tasks
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tasks</span>
                <span className="font-semibold text-gray-900">
                  {reportsData.system_overview.total_tasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Tasks per User</span>
                <span className="font-semibold text-gray-900">
                  {reportsData.system_overview.total_users > 0
                    ? Math.round(
                        reportsData.system_overview.total_tasks /
                          reportsData.system_overview.total_users
                      )
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "overview", name: "Task Distribution", icon: "📊" },
              { id: "users", name: "User Performance", icon: "👤" },
              { id: "projects", name: "Project Analytics", icon: "📁" },
              { id: "performance", name: "Performance Trends", icon: "📈" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Task Status Distribution
              </h3>
              {getTaskStatusChart() && (
                <Pie data={getTaskStatusChart()!} options={pieOptions} />
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Task Priority Distribution
              </h3>
              {getTaskPriorityChart() && (
                <Pie data={getTaskPriorityChart()!} options={pieOptions} />
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                User Task Overview
              </h3>
              {getUserTasksChart() && (
                <Bar data={getUserTasksChart()!} options={chartOptions} />
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Performers by Completion Rate
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Tasks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        In Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportsData.user_stats
                      .filter((user) => user.total_tasks > 0)
                      .sort((a, b) => b.completion_rate - a.completion_rate)
                      .slice(0, 10)
                      .map((user) => (
                        <tr key={user.user_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.user_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.user_email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.total_tasks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {user.completed_tasks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {user.in_progress_tasks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${user.completion_rate}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-900">
                                {user.completion_rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Performance
              </h3>
              {getProjectPerformanceChart() && (
                <Bar
                  data={getProjectPerformanceChart()!}
                  options={chartOptions}
                />
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Statistics
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Tasks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportsData.project_stats
                      .sort((a, b) => b.total_tasks - a.total_tasks)
                      .map((project) => (
                        <tr key={project.project_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {project.project_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.team_size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.total_tasks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {project.completed_tasks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${project.completion_rate}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-900">
                                {project.completion_rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Completion Rate Trends
            </h3>
            {getCompletionRateChart() && (
              <Line data={getCompletionRateChart()!} options={chartOptions} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
