import CareerRoadmap from "../models/CareerRoadmap.js";
import { generateCareerRoadmapWithAI } from "../services/aiCareerRoadmapService.js";

export const generateCareerRoadmap = async (req, res) => {
  try {
    const {
      careerGoal,
      targetRole,
      currentLevel,
      knownSkills,
      timeCommitment,
    } = req.body;

    if (!careerGoal || !targetRole) {
      return res.status(400).json({
        success: false,
        message: "Career goal and target role are required",
      });
    }

    const aiRoadmap = await generateCareerRoadmapWithAI({
      careerGoal,
      targetRole,
      currentLevel,
      knownSkills,
      timeCommitment,
    });

    const roadmap = await CareerRoadmap.create({
      user: req.user._id,
      careerGoal,
      currentLevel,
      targetRole: aiRoadmap.targetRole,
      roadmap: aiRoadmap.roadmap,
      tools: aiRoadmap.tools,
      interviewTopics: aiRoadmap.interviewTopics,
      portfolioProjects: aiRoadmap.portfolioProjects,
      estimatedTimeline: aiRoadmap.estimatedTimeline,
    });

    return res.status(201).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate roadmap",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
};

export const getMyCareerRoadmaps = async (req, res) => {
  try {
    const roadmaps = await CareerRoadmap.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: roadmaps.length,
      roadmaps,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roadmaps",
    });
  }
};

export const getCareerRoadmapById = async (req, res) => {
  try {
    const roadmap = await CareerRoadmap.findOne({
      _id: req.params.roadmapId,
      user: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roadmap",
    });
  }
};

export const deleteCareerRoadmap = async (req, res) => {
  try {
    const roadmap = await CareerRoadmap.findOneAndDelete({
      _id: req.params.roadmapId,
      user: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Roadmap deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete roadmap",
    });
  }
};