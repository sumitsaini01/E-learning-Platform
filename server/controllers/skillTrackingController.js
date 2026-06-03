import SkillProfile from "../models/SkillProfile.js";
import { recalculateUserSkills } from "../utils/skillTrackingHelper.js";

export const getMySkills = async (req, res) => {
  try {
    const profile = await recalculateUserSkills(req.user._id);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const refreshMySkills = async (req, res) => {
  try {
    const profile = await recalculateUserSkills(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Skills refreshed successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to refresh skills",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const getSkillProfileSnapshot = async (req, res) => {
  try {
    let profile = await SkillProfile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      profile = await recalculateUserSkills(req.user._id);
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch skill snapshot",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
