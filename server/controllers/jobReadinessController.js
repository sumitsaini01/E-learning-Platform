import Certificate from "../models/Certificate.js";
import JobReadiness from "../models/JobReadiness.js";
import MockInterview from "../models/MockInterview.js";
import Progress from "../models/Progress.js";
import QuizAttempt from "../models/QuizAttempt.js";
import SkillProfile from "../models/SkillProfile.js";

const calculateLevel = (score) => {
  if (score >= 85) return "strong-candidate";
  if (score >= 70) return "job-ready";
  if (score >= 50) return "getting-ready";

  return "not-ready";
};

export const generateJobReadiness = async (req, res) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    const userId = req.user._id;

    const skillProfile = await SkillProfile.findOne({
      user: userId,
    });

    const certificates = await Certificate.find({
      user: userId,
    });

    const progressRecords = await Progress.find({
      user: userId,
    });

    const quizAttempts = await QuizAttempt.find({
      user: userId,
    });

    const interviews = await MockInterview.find({
      user: userId,
      status: "completed",
    });

    /*
    |--------------------------------------------------------------------------
    | Skill Score
    |--------------------------------------------------------------------------
    */

    const skillCount = skillProfile?.skills?.length || 0;

    const skillScore = Math.min(skillCount * 10, 100);

    /*
    |--------------------------------------------------------------------------
    | Certificate Score
    |--------------------------------------------------------------------------
    */

    const certificateScore = Math.min(certificates.length * 15, 100);

    /*
    |--------------------------------------------------------------------------
    | Progress Score
    |--------------------------------------------------------------------------
    */

    let progressScore = 0;

    if (progressRecords.length) {
      const percentages = progressRecords.map((progress) => {
        const totalLessons = progress.lessonProgress?.length || 0;

        const completedLessons =
          progress.lessonProgress?.filter((lesson) => lesson.completed)
            .length || 0;

        if (!totalLessons) return 0;

        return Math.round((completedLessons / totalLessons) * 100);
      });

      progressScore = Math.round(
        percentages.reduce((sum, score) => sum + score, 0) / percentages.length,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Quiz Score
    |--------------------------------------------------------------------------
    */

    let quizScore = 0;

    if (quizAttempts.length) {
      quizScore = Math.round(
        quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) /
          quizAttempts.length,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Mock Interview Score
    |--------------------------------------------------------------------------
    */

    let interviewScore = 0;

    if (interviews.length) {
      interviewScore = Math.round(
        interviews.reduce(
          (sum, interview) => sum + (interview.overallScore || 0) * 10,
          0,
        ) / interviews.length,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Overall Score
    |--------------------------------------------------------------------------
    */

    const overallScore = Math.round(
      skillScore * 0.25 +
        certificateScore * 0.15 +
        progressScore * 0.2 +
        quizScore * 0.2 +
        interviewScore * 0.2,
    );

    const breakdown = [
      {
        label: "Skills",
        score: skillScore,
        reason: `${skillCount} tracked skills`,
      },
      {
        label: "Certificates",
        score: certificateScore,
        reason: `${certificates.length} certificates earned`,
      },
      {
        label: "Course Progress",
        score: progressScore,
        reason: "Based on course completion progress",
      },
      {
        label: "Quiz Performance",
        score: quizScore,
        reason: "Based on average quiz score",
      },
      {
        label: "Interview Readiness",
        score: interviewScore,
        reason: "Based on AI mock interview performance",
      },
    ];

    const strengths = [];
    const gaps = [];
    const recommendations = [];

    breakdown.forEach((item) => {
      if (item.score >= 75) {
        strengths.push(item.label);
      } else if (item.score < 50) {
        gaps.push(item.label);

        recommendations.push(`Improve ${item.label.toLowerCase()}`);
      }
    });

    const readiness = await JobReadiness.create({
      user: userId,
      targetRole: targetRole.trim(),
      overallScore,
      level: calculateLevel(overallScore),
      breakdown,
      strengths,
      gaps,
      recommendations,
    });

    return res.status(201).json({
      success: true,
      message: "Job readiness generated successfully",
      readiness,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate job readiness score",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const getMyJobReadinessReports = async (req, res) => {
  try {
    const reports = await JobReadiness.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch readiness reports",
    });
  }
};

export const getJobReadinessById = async (req, res) => {
  try {
    const report = await JobReadiness.findOne({
      _id: req.params.reportId,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Readiness report not found",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch readiness report",
    });
  }
};

export const deleteJobReadiness = async (req, res) => {
  try {
    const report = await JobReadiness.findOneAndDelete({
      _id: req.params.reportId,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Readiness report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Readiness report deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete readiness report",
    });
  }
};
