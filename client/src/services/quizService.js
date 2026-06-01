import api from "./api";

/*
|--------------------------------------------------------------------------
| Instructor Quiz Management
|--------------------------------------------------------------------------
*/

export const createQuiz = async (payload) => {
  const response = await api.post("/quizzes", payload);

  return response.data;
};

export const generateAIQuiz = async (payload) => {
  const response = await api.post("/quizzes/generate-ai", payload);

  return response.data;
};
export const getInstructorQuizzes = async () => {
  const response = await api.get("/quizzes/instructor");

  return response.data;
};

export const updateQuiz = async (quizId, payload) => {
  if (!quizId) {
    throw new Error("Quiz ID is required");
  }

  const response = await api.put(`/quizzes/${quizId}`, payload);

  return response.data;
};

export const deleteQuiz = async (quizId) => {
  if (!quizId) {
    throw new Error("Quiz ID is required");
  }

  const response = await api.delete(`/quizzes/${quizId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Course Quizzes
|--------------------------------------------------------------------------
*/

export const getCourseQuizzes = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.get(`/quizzes/course/${courseId}`);

  return response.data;
};

export const getQuizById = async (quizId) => {
  if (!quizId) {
    throw new Error("Quiz ID is required");
  }

  const response = await api.get(`/quizzes/${quizId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Student Quiz Attempts
|--------------------------------------------------------------------------
*/

export const startQuizAttempt = async (quizId) => {
  if (!quizId) {
    throw new Error("Quiz ID is required");
  }

  const response = await api.post(`/quizzes/${quizId}/start`);

  return response.data;
};

export const submitQuizAttempt = async (quizId, attemptId, answers) => {
  if (!quizId) {
    throw new Error("Quiz ID is required");
  }

  const response = await api.post(`/quizzes/${quizId}/attempt`, {
    attemptId,
    answers,
  });

  return response.data;
};

export const getMyQuizAttempts = async () => {
  const response = await api.get("/quizzes/attempts/my");

  return response.data;
};
