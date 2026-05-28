import Activity from "../models/Activity.js";

const sendServerError = (res, message, error) => {
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
};

export const getMyActivities = async (req, res) => {
  try {
    const { limit = 20, type } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (type) {
      filter.type = type;
    }

    const activities = await Activity.find(filter)
      .populate("course", "title category level")
      .populate("quiz", "title")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 20, 100));

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch activities", error);
  }
};

export const getActivitySummary = async (req, res) => {
  try {
    const activities = await Activity.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const summary = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    const recentActivities = activities.slice(0, 5);

    return res.status(200).json({
      success: true,
      totalActivities: activities.length,
      summary,
      recentActivities,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch activity summary", error);
  }
};