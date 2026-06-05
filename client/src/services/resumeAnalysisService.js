import api from "./api";

export const analyzeResume = async ({ targetRole, resume }) => {
  const formData = new FormData();

  formData.append("targetRole", targetRole);
  formData.append("resume", resume);

  const response = await api.post("/resume-analysis/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getMyResumeAnalyses = async () => {
  const response = await api.get("/resume-analysis/my");

  return response.data;
};

export const deleteResumeAnalysis = async (analysisId) => {
  const response = await api.delete(`/resume-analysis/${analysisId}`);

  return response.data;
};
