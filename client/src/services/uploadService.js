import api from "./api";

export const uploadThumbnail = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await api.post("/uploads/thumbnail", formData);

  return data;
};

export const uploadVideo = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await api.post("/uploads/video", formData);

  return data;
};