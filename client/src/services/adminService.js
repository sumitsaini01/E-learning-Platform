import api from "./api";

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", {
    params,
  });

  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.patch(
    `/admin/users/${userId}/role`,
    { role },
  );

  return response.data;
};

export const getAdminCourses = async (params = {}) => {
  const response = await api.get("/admin/courses", {
    params,
  });

  return response.data;
};