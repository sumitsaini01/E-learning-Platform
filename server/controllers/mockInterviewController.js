import MockInterview from "../models/MockInterview.js";
import {
  evaluateInterviewAnswer,
  generateMockInterviewQuestions,
} from "../services/aiMockInterviewService.js";

export const startMockInterview = async (req, res) => {
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

    const questions = await generateMockInterviewQuestions({
      userId: req.user._id,
      targetRole: targetRole.trim(),
      targetCompany: targetCompany.trim(),
      experienceType,
    });

    if (!questions.length) {
      return res.status(500).json({
        success: false,
        message: "No interview questions generated",
      });
    }

    const interview = await MockInterview.create({
      user: req.user._id,
      targetRole: targetRole.trim(),
      targetCompany: targetCompany.trim(),
      experienceType,
      questions,
    });

    return res.status(201).json({
      success: true,
      message: "Mock interview started successfully",
      interview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to start mock interview",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const submitMockInterviewAnswer = async (req, res) => {
  try {
    const { interviewId, questionId } = req.params;
    const { answer } = req.body;

    if (!answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const interview = await MockInterview.findOne({
      _id: interviewId,
      user: req.user._id,
      status: "in_progress",
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Active mock interview not found",
      });
    }

    const question = interview.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const evaluation = await evaluateInterviewAnswer({
      question: question.question,
      expectedAnswer: question.expectedAnswer,
      userAnswer: answer.trim(),
    });

    question.userAnswer = answer.trim();
    question.score = Math.max(0, Math.min(10, Number(evaluation.score) || 0));
    question.feedback = evaluation.feedback;
    question.strengths = evaluation.strengths;
    question.improvements = evaluation.improvements;

    const answeredQuestions = interview.questions.filter((item) =>
      item.userAnswer?.trim(),
    );

    if (answeredQuestions.length === interview.questions.length) {
      const totalScore = interview.questions.reduce(
        (sum, item) => sum + Number(item.score || 0),
        0,
      );

      interview.overallScore = Number(
        (totalScore / interview.questions.length).toFixed(1),
      );

      interview.status = "completed";
      interview.completedAt = new Date();

      interview.overallFeedback =
        interview.overallScore >= 8
          ? "Strong interview performance. Keep practicing advanced and scenario-based questions."
          : interview.overallScore >= 6
            ? "Good attempt. Improve depth, examples, and clarity in your answers."
            : "Needs improvement. Revise fundamentals and practice structured answers.";
    }

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Answer evaluated successfully",
      interview,
      evaluation: {
        score: question.score,
        feedback: question.feedback,
        strengths: question.strengths,
        improvements: question.improvements,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to evaluate answer",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const getMyMockInterviews = async (req, res) => {
  try {
    const interviews = await MockInterview.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mock interviews",
    });
  }
};

export const getMockInterviewById = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Mock interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mock interview",
    });
  }
};

export const deleteMockInterview = async (req, res) => {
  try {
    const interview = await MockInterview.findOneAndDelete({
      _id: req.params.interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Mock interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mock interview deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete mock interview",
    });
  }
};
