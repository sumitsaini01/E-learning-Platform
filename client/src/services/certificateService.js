import api from "./api";

/*
|--------------------------------------------------------------------------
| Certificate APIs
|--------------------------------------------------------------------------
*/

export const generateCertificate = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post(
    `/certificates/courses/${courseId}/generate`,
  );

  return response.data;
};

export const getMyCertificates = async () => {
  const response = await api.get("/certificates/my");

  return response.data;
};

export const verifyCertificate = async (certificateId) => {
  if (!certificateId) {
    throw new Error("Certificate ID is required");
  }

  const response = await api.get(
    `/certificates/verify/${certificateId}`,
  );

  return response.data;
};