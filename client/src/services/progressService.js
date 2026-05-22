import api from "./api";

/*
|--------------------------------------------------------------------------
| Progress Tracking
|--------------------------------------------------------------------------
*/

export const getCourseProgress = async (
  courseId,
) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.get(
    `/progress/${courseId}`,
  );

  return response.data;
};

export const markLessonComplete =
  async (courseId, lessonId) => {
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