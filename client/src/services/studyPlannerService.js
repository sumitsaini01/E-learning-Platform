import api from "./api";

export const generateStudyPlan = async (payload) => {
  const response = await api.post("/study-plans/generate", payload);

  return response.data;
};

export const getMyStudyPlans = async () => {
  const response = await api.get("/study-plans/my");

  return response.data;
};

export const getStudyPlanById = async (planId) => {
  const response = await api.get(`/study-plans/${planId}`);

  return response.data;
};

export const deleteStudyPlan = async (planId) => {
  const response = await api.delete(`/study-plans/${planId}`);

  return response.data;
};
