import api from "./api";

/*
|--------------------------------------------------------------------------
| Notification Services
|--------------------------------------------------------------------------
*/

export const getMyNotifications =
  async (params = {}) => {
    const response = await api.get(
      "/notifications/my",
      {
        params,
      },
    );

    return response.data;
  };

export const markNotificationAsRead =
  async (notificationId) => {
    const response = await api.patch(
      `/notifications/${notificationId}/read`,
    );

    return response.data;
  };

export const markAllNotificationsAsRead =
  async () => {
    const response = await api.patch(
      "/notifications/mark-all-read",
    );

    return response.data;
  };

export const deleteNotification =
  async (notificationId) => {
    const response = await api.delete(
      `/notifications/${notificationId}`,
    );

    return response.data;
  };