import api from "./api";

/*
|--------------------------------------------------------------------------
| Public Courses
|--------------------------------------------------------------------------
*/

export const getCourses = async (params = {}) => {
  const response = await api.get("/courses", {
    params,
  });

  return response.data;
};

export const getCourseById = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.get(`/courses/${courseId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Student Actions
|--------------------------------------------------------------------------
*/

export const enrollInCourse = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(`/courses/${courseId}/enroll`);

  return response.data;
};

export const getStudentEnrolledCourses = async () => {
  const response = await api.get("/courses/student/enrolled");

  return response.data;
};

export const getSavedCourses = async () => {
  const response = await api.get("/courses/student/saved");

  return response.data;
};

export const getRecommendedCourses = async () => {
  const response = await api.get("/courses/student/recommended");

  return response.data;
};

export const saveCourse = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(`/courses/${courseId}/save`);

  return response.data;
};

export const removeSavedCourse = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.delete(`/courses/${courseId}/save`);

  return response.data;
};

export const generateStudyNotes = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(`/courses/${courseId}/generate-study-notes`);

  return response.data;
};

export const generateFlashcards = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(`/courses/${courseId}/generate-flashcards`);

  return response.data;
};

export const getAiStudyResources = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.get(`/courses/${courseId}/ai-study-resources`);

  return response.data;
};

export const createCourseReview = async (courseId, payload) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(`/courses/${courseId}/reviews`, payload);

  return response.data;
};

export const updateCourseReview = async (courseId, reviewId, payload) => {
  if (!courseId || !reviewId) {
    throw new Error("Course ID and Review ID are required");
  }

  const response = await api.put(
    `/courses/${courseId}/reviews/${reviewId}`,
    payload,
  );

  return response.data;
};

export const deleteCourseReview = async (courseId, reviewId) => {
  if (!courseId || !reviewId) {
    throw new Error("Course ID and Review ID are required");
  }

  const response = await api.delete(`/courses/${courseId}/reviews/${reviewId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Instructor Actions
|--------------------------------------------------------------------------
*/

export const createCourse = async (payload) => {
  const response = await api.post("/courses", payload);

  return response.data;
};

export const generateCourseDescription = async (payload) => {
  const response = await api.post("/courses/generate-description", payload);

  return response.data;
};

export const getInstructorCourses = async () => {
  const response = await api.get("/courses/instructor/courses");

  return response.data;
};

export const getInstructorAnalytics = async () => {
  const response = await api.get("/courses/instructor/analytics");

  return response.data;
};

export const updateCourse = async (courseId, payload) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.put(`/courses/${courseId}`, payload);

  return response.data;
};

export const deleteCourse = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.delete(`/courses/${courseId}`);

  return response.data;
};

export const publishCourse = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.patch(`/courses/${courseId}/publish`);

  return response.data;
};

export const unpublishCourse = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.patch(`/courses/${courseId}/unpublish`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Course Curriculum
|--------------------------------------------------------------------------
*/

export const addSection = async (courseId, payload) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(`/courses/${courseId}/sections`, payload);

  return response.data;
};

export const updateSection = async (courseId, sectionId, payload) => {
  if (!courseId || !sectionId) {
    throw new Error("Course ID and Section ID are required");
  }

  const response = await api.put(
    `/courses/${courseId}/sections/${sectionId}`,
    payload,
  );

  return response.data;
};

export const deleteSection = async (courseId, sectionId) => {
  if (!courseId || !sectionId) {
    throw new Error("Course ID and Section ID are required");
  }

  const response = await api.delete(
    `/courses/${courseId}/sections/${sectionId}`,
  );

  return response.data;
};

export const addLesson = async (courseId, sectionId, payload) => {
  if (!courseId || !sectionId) {
    throw new Error("Course ID and Section ID are required");
  }

  const response = await api.post(
    `/courses/${courseId}/sections/${sectionId}/lessons`,
    payload,
  );

  return response.data;
};

export const updateLesson = async (courseId, sectionId, lessonId, payload) => {
  if (!courseId || !sectionId || !lessonId) {
    throw new Error("Course ID, Section ID and Lesson ID are required");
  }

  const response = await api.put(
    `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
    payload,
  );

  return response.data;
};

export const deleteLesson = async (courseId, sectionId, lessonId) => {
  if (!courseId || !sectionId || !lessonId) {
    throw new Error("Course ID, Section ID and Lesson ID are required");
  }

  const response = await api.delete(
    `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
  );

  return response.data;
};

export const moveLesson = async (
  courseId,
  sectionId,
  lessonId,
  targetSectionId,
) => {
  if (!courseId || !sectionId || !lessonId || !targetSectionId) {
    throw new Error(
      "Course ID, Section ID, Lesson ID and Target Section ID are required",
    );
  }

  const response = await api.patch(
    `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/move`,
    {
      targetSectionId,
    },
  );

  return response.data;
};
