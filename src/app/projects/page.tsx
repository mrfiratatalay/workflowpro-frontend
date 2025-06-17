"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, isAuthenticated } from "../../utils/auth";

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface TeamMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user: User;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  team_members?: TeamMember[];
  tasks_count?: number;
}

interface ProjectCreate {
  name: string;
  description: string;
  status: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [newProject, setNewProject] = useState<ProjectCreate>({
    name: "",
    description: "",
    status: "planning",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:8000/projects", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/projects/${projectId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedProject(data);
        setShowTeamModal(true);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        setNewProject({ name: "", description: "", status: "planning" });
        setShowCreateForm(false);
        fetchProjects();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    }
  };

  const searchUsers = async (email: string) => {
    if (email.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/users/search?email=${encodeURIComponent(email)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const addTeamMember = async (userId: number, role: string = "member") => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `http://localhost:8000/projects/${selectedProject.id}/team`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, role }),
        }
      );

      if (response.ok) {
        fetchProjectDetails(selectedProject.id);
        setSearchEmail("");
        setSearchResults([]);
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error("Error adding team member:", error);
    }
  };

  const removeTeamMember = async (userId: number) => {
    if (!selectedProject) return;

    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/projects/${selectedProject.id}/team/${userId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );

        if (response.ok) {
          fetchProjectDetails(selectedProject.id);
        } else {
          const error = await response.json();
          alert(`Error: ${error.detail}`);
        }
      } catch (error) {
        console.error("Error removing team member:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "on_hold":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-600">
              Manage your projects and team members
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Create Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {project.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{project.description}</p>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => fetchProjectDetails(project.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  Manage Team
                </button>
                <button
                  onClick={() => router.push(`/tasks?project=${project.id}`)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  View Tasks
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first project
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Create Project
            </button>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              <form onSubmit={createProject}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({ ...newProject, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Team Management Modal */}
        {showTeamModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Team Management - {selectedProject.name}
                </h2>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Add Team Member */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Add Team Member</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => {
                      setSearchEmail(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex justify-between items-center p-3 hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-gray-600">
                            {user.email}
                          </div>
                        </div>
                        <button
                          onClick={() => addTeamMember(user.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team Members List */}
              <div>
                <h3 className="text-lg font-medium mb-3">Team Members</h3>
                <div className="space-y-2">
                  {selectedProject.team_members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">
                            {member.user.full_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {member.user.email}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            member.role
                          )}`}
                        >
                          {member.role}
                        </span>
                      </div>
                      {member.role !== "owner" && (
                        <button
                          onClick={() => removeTeamMember(member.user.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
