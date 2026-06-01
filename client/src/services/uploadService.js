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

export const uploadAvatar = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/uploads/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
