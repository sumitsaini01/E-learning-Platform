import InterviewPrep from "../models/InterviewPrep.js";
import { generateInterviewPrepWithAI } from "../services/aiInterviewPrepService.js";

export const generateInterviewPrep = async (req, res) => {
  try {
    const { targetRole, targetCompany, experienceType } = req.body;

    if (!targetRole?.trim() || !targetCompany?.trim() || !experienceType) {
      return res.status(400).json({
        success: false,
        message:
          "Target role, target company, and experience type are required",
      });
    }

    const allowedExperienceTypes = ["fresher", "entry-level", "experienced"];

    if (!allowedExperienceTypes.includes(experienceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience type",
      });
    }

    const aiPrep = await generateInterviewPrepWithAI({
      targetRole: targetRole.trim(),
      targetCompany: targetCompany.trim(),
      experienceType,
    });

    const interviewPrep = await InterviewPrep.create({
      user: req.user._id,
      targetRole: targetRole.trim(),
      targetCompany: targetCompany.trim(),
      experienceType,
      questions: aiPrep.questions,
      importantTopics: aiPrep.importantTopics,
      preparationTips: aiPrep.preparationTips,
    });

    return res.status(201).json({
      success: true,
      message: "Interview preparation generated successfully",
      interviewPrep,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate interview preparation",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const getMyInterviewPreps = async (req, res) => {
  try {
    const interviewPreps = await InterviewPrep.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviewPreps.length,
      interviewPreps,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview preparations",
    });
  }
};

export const getInterviewPrepById = async (req, res) => {
  try {
    const interviewPrep = await InterviewPrep.findOne({
      _id: req.params.prepId,
      user: req.user._id,
    });

    if (!interviewPrep) {
      return res.status(404).json({
        success: false,
        message: "Interview preparation not found",
      });
    }

    return res.status(200).json({
      success: true,
      interviewPrep,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview preparation",
    });
  }
};

export const deleteInterviewPrep = async (req, res) => {
  try {
    const interviewPrep = await InterviewPrep.findOneAndDelete({
      _id: req.params.prepId,
      user: req.user._id,
    });

    if (!interviewPrep) {
      return res.status(404).json({
        success: false,
        message: "Interview preparation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview preparation deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete interview preparation",
    });
  }
};
