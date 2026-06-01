import api from "./api";

export const getCourseNotes = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.get(`/notes/course/${courseId}`);

  return response.data;
};

export const getLessonNote = async (courseId, lessonId) => {
  if (!courseId || !lessonId) {
    throw new Error("Course ID and Lesson ID are required");
  }

  const response = await api.get(`/notes/course/${courseId}/lesson/${lessonId}`);

  return response.data;
};

export const saveLessonNote = async (courseId, lessonId, payload) => {
  if (!courseId || !lessonId) {
    throw new Error("Course ID and Lesson ID are required");
  }

  const response = await api.put(
    `/notes/course/${courseId}/lesson/${lessonId}`,
    payload,
  );

  return response.data;
};

export const deleteLessonNote = async (courseId, lessonId) => {
  if (!courseId || !lessonId) {
    throw new Error("Course ID and Lesson ID are required");
  }

  const response = await api.delete(
    `/notes/course/${courseId}/lesson/${lessonId}`,
  );

  return response.data;
};