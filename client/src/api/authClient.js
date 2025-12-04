// client/src/api/authClient.js
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// later: use env: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
};

export { API_BASE };
