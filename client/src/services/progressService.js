import api from "./api";

/*
|--------------------------------------------------------------------------
| Get Course Progress
|--------------------------------------------------------------------------
*/

export const getCourseProgress = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.get(`/progress/${courseId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Manual Lesson Completion
|--------------------------------------------------------------------------
*/

export const markLessonComplete = async (
  courseId,
  lessonId,
) => {
  if (!courseId || !lessonId) {
    throw new Error(
      "Course ID and Lesson ID are required",
    );
  }

  const response = await api.post(
    `/progress/${courseId}/complete`,
    {
      lessonId,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Video Watch Tracking
|--------------------------------------------------------------------------
*/

export const updateLessonWatchProgress =
  async (
    courseId,
    payload,
  ) => {
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    const response = await api.post(
      `/progress/${courseId}/watch`,
      payload,
    );

    return response.data;
  };