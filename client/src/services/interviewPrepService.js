import api from "./api";

export const generateInterviewPrep = async (payload) => {
  const response = await api.post("/interview-prep/generate", payload);

  return response.data;
};

export const getMyInterviewPreps = async () => {
  const response = await api.get("/interview-prep/my");

  return response.data;
};

export const getInterviewPrepById = async (prepId) => {
  const response = await api.get(`/interview-prep/${prepId}`);

  return response.data;
};

export const deleteInterviewPrep = async (prepId) => {
  const response = await api.delete(`/interview-prep/${prepId}`);

  return response.data;
};
