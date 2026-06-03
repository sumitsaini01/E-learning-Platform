import api from "./api";

export const getMySkills = async () => {
  const response = await api.get("/skills/my");

  return response.data;
};

export const getSkillSnapshot = async () => {
  const response = await api.get("/skills/snapshot");

  return response.data;
};

export const refreshMySkills = async () => {
  const response = await api.post("/skills/refresh");

  return response.data;
};