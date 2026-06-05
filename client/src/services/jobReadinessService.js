import api from "./api";

export const generateJobReadiness = async (payload) => {
  const response = await api.post(
    "/job-readiness/generate",
    payload,
  );

  return response.data;
};

export const getMyJobReadinessReports = async () => {
  const response = await api.get("/job-readiness/my");

  return response.data;
};

export const getJobReadinessById = async (reportId) => {
  const response = await api.get(
    `/job-readiness/${reportId}`,
  );

  return response.data;
};

export const deleteJobReadiness = async (reportId) => {
  const response = await api.delete(
    `/job-readiness/${reportId}`,
  );

  return response.data;
};