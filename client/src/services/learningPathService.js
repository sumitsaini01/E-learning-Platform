import api from "./api";

export const generateLearningPath = async (payload) => {
  const response = await api.post("/learning-paths/generate", payload);

  return response.data;
};

export const getMyLearningPaths = async () => {
  const response = await api.get("/learning-paths/my");

  return response.data;
};

export const deleteLearningPath = async (pathId) => {
  const response = await api.delete(`/learning-paths/${pathId}`);

  return response.data;
};
