// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  ME: `${API_BASE_URL}/me`,
  TASKS: `${API_BASE_URL}/tasks`,
  PROJECTS: `${API_BASE_URL}/projects`,
  REPORTS: `${API_BASE_URL}/reports`,
  USERS_SEARCH: `${API_BASE_URL}/users/search`,
} as const;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Export the base URL for direct use
export { API_BASE_URL };
