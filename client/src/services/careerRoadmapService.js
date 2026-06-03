import api from "./api";

export const generateCareerRoadmap = async (payload) => {
  const response = await api.post("/career-roadmaps/generate", payload);

  return response.data;
};

export const getMyCareerRoadmaps = async () => {
  const response = await api.get("/career-roadmaps/my");

  return response.data;
};

export const getCareerRoadmapById = async (roadmapId) => {
  const response = await api.get(`/career-roadmaps/${roadmapId}`);

  return response.data;
};

export const deleteCareerRoadmap = async (roadmapId) => {
  const response = await api.delete(`/career-roadmaps/${roadmapId}`);

  return response.data;
};
