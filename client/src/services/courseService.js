import api from "./api";

export const getCourses = async (params = {}) => {
  const response = await api.get("/courses", { params });
  return response.data;
};

export const getCourseById = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export const enrollInCourse = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(`/courses/${courseId}/enroll`);
  return response.data;
};

/*
Future scalable service structure:

export const createCourse = async (payload) => {}
export const updateCourse = async (id, payload) => {}
export const deleteCourse = async (id) => {}
export const uploadThumbnail = async () => {}
export const getInstructorCourses = async () => {}
*/