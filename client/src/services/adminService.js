import api from "./api";

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getAdminUserAnalytics = async () => {
  const response = await api.get("/admin/analytics/users");
  return response.data;
};

export const getAdminCourseAnalytics = async () => {
  const response = await api.get("/admin/analytics/courses");
  return response.data;
};

export const getAdminRevenueAnalytics = async () => {
  const response = await api.get("/admin/analytics/revenue");
  return response.data;
};

export const getAdminEnrollmentAnalytics = async () => {
  const response = await api.get("/admin/analytics/enrollments");
  return response.data;
};

export const getAdminQuizAnalytics = async () => {
  const response = await api.get("/admin/analytics/quizzes");
  return response.data;
};

export const getAdminCertificateAnalytics = async () => {
  const response = await api.get("/admin/analytics/certificates");
  return response.data;
};

export const getAdminPlatformMonitoring = async () => {
  const response = await api.get("/admin/monitoring");
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", {
    params,
  });

  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });

  return response.data;
};

export const getAdminCourses = async (params = {}) => {
  const response = await api.get("/admin/courses", {
    params,
  });

  return response.data;
};

export const updateUserVerificationStatus = async (userId, isEmailVerified) => {
  const response = await api.patch(`/admin/users/${userId}/verification`, {
    isEmailVerified,
  });

  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);

  return response.data;
};

export const updateAdminCourseStatus = async (courseId, status) => {
  const response = await api.patch(`/admin/courses/${courseId}/status`, {
    status,
  });

  return response.data;
};

export const deleteAdminCourse = async (courseId) => {
  const response = await api.delete(`/admin/courses/${courseId}`);

  return response.data;
};
