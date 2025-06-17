export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
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

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string | null;
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetchWithAuth("http://localhost:8000/me");
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
};
