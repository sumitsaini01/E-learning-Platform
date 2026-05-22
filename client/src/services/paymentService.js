import api from "./api";

export const createPaymentOrder = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const response = await api.post("/payment/create-order", {
    courseId,
  });

  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await api.post("/payment/verify", payload);

  return response.data;
};

export const getMyPurchases = async () => {
  const response = await api.get("/payment/my-purchases");

  return response.data;
};