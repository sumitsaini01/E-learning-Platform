import api from "./api";

export const getCourseDiscussions = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.get(`/discussions/course/${courseId}`);

  return response.data;
};

export const createDiscussion = async (courseId, payload) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(`/discussions/course/${courseId}`, payload);

  return response.data;
};

export const replyToDiscussion = async (discussionId, payload) => {
  if (!discussionId) {
    throw new Error("Discussion ID is required");
  }

  const response = await api.post(
    `/discussions/${discussionId}/replies`,
    payload,
  );

  return response.data;
};

export const toggleDiscussionResolved = async (discussionId) => {
  if (!discussionId) {
    throw new Error("Discussion ID is required");
  }

  const response = await api.patch(`/discussions/${discussionId}/resolved`);

  return response.data;
};