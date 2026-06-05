import StudyPlanner from "../models/StudyPlanner.js";
import { generateStudyPlanWithAI } from "../services/aiStudyPlannerService.js";

export const generateStudyPlan = async (req, res) => {
  try {
    const { goal, targetRole, durationDays, hoursPerDay, currentLevel } =
      req.body;

    if (!goal?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal is required",
      });
    }

    if (!durationDays || Number(durationDays) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid duration is required",
      });
    }

    if (!hoursPerDay || Number(hoursPerDay) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid hours per day is required",
      });
    }

    const aiPlan = await generateStudyPlanWithAI({
      goal: goal.trim(),
      targetRole: targetRole?.trim() || "",
      durationDays: Number(durationDays),
      hoursPerDay: Number(hoursPerDay),
      currentLevel: currentLevel || "beginner",
    });

    const studyPlan = await StudyPlanner.create({
      user: req.user._id,
      goal: goal.trim(),
      targetRole: targetRole?.trim() || "",
      durationDays: Number(durationDays),
      hoursPerDay: Number(hoursPerDay),
      currentLevel: currentLevel || "beginner",
      plan: aiPlan.plan,
      milestones: aiPlan.milestones,
      revisionStrategy: aiPlan.revisionStrategy,
      finalOutcome: aiPlan.finalOutcome,
    });

    return res.status(201).json({
      success: true,
      message: "Study plan generated successfully",
      studyPlan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate study plan",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const getMyStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlanner.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch study plans",
    });
  }
};

export const getStudyPlanById = async (req, res) => {
  try {
    const plan = await StudyPlanner.findOne({
      _id: req.params.planId,
      user: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Study plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch study plan",
    });
  }
};

export const deleteStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlanner.findOneAndDelete({
      _id: req.params.planId,
      user: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Study plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Study plan deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete study plan",
    });
  }
};
