import api from "./api";

const TOKEN_KEY = "skillsphere_token";
const USER_KEY = "skillsphere_user";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    clearAuthSession();
    return null;
  }
};

export const setAuthSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.put(`/auth/reset-password/${token}`, {
    password,
  });

  return data;
};

export const changePassword = async (payload) => {
  const response = await api.put("/auth/change-password", payload);

  return response.data;
};
