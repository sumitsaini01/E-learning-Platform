import API from "./api";

export const getSecurityDashboard = async () => {
  const { data } = await API.get("/security/dashboard");
  return data;
};

export const getAuditLogs = async (params = {}) => {
  const { data } = await API.get("/security/audit-logs", { params });
  return data;
};

export const getLoginSecurityLogs = async (params = {}) => {
  const { data } = await API.get("/security/login-logs", { params });
  return data;
};
