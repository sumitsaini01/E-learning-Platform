import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("skillsphere_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentPath = window.location.pathname;

    if (
      error.response?.status === 401 &&
      currentPath !== "/login" &&
      currentPath !== "/register"
    ) {
      localStorage.removeItem("skillsphere_token");
      localStorage.removeItem("skillsphere_user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
