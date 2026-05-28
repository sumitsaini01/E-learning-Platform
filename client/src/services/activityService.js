import api from "./api";

/*
|--------------------------------------------------------------------------
| Activity Services
|--------------------------------------------------------------------------
*/

export const getMyActivities = async (
  params = {},
) => {
  const response = await api.get(
    "/activities/my",
    {
      params,
    },
  );

  return response.data;
};

export const getActivitySummary =
  async () => {
    const response = await api.get(
      "/activities/summary",
    );

    return response.data;
  };