import { API_ENDPOINTS } from "./api";

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
}

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
};

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetchWithAuth(API_ENDPOINTS.ME);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
};
