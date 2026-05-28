import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";

export const createActivity = async ({
  user,
  role,
  type,
  title,
  message = "",
  course = null,
  quiz = null,
  metadata = {},
}) => {
  try {
    await Activity.create({
      user,
      role,
      type,
      title,
      message,
      course,
      quiz,
      metadata,
    });
  } catch (error) {
    console.error("Create activity error:", error.message);
  }
};

export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  course = null,
  quiz = null,
  metadata = {},
}) => {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message,
      course,
      quiz,
      metadata,
    });
  } catch (error) {
    console.error(
      "Create notification error:",
      error.message,
    );
  }
};