import api from "./api";

export const startMockInterview = async (payload) => {
  const response = await api.post("/mock-interviews/start", payload);

  return response.data;
};

export const submitMockInterviewAnswer = async (
  interviewId,
  questionId,
  answer,
) => {
  const response = await api.put(
    `/mock-interviews/${interviewId}/questions/${questionId}/answer`,
    {
      answer,
    },
  );

  return response.data;
};

export const getMyMockInterviews = async () => {
  const response = await api.get("/mock-interviews/my");

  return response.data;
};

export const getMockInterviewById = async (interviewId) => {
  const response = await api.get(`/mock-interviews/${interviewId}`);

  return response.data;
};

export const deleteMockInterview = async (interviewId) => {
  const response = await api.delete(`/mock-interviews/${interviewId}`);

  return response.data;
};
