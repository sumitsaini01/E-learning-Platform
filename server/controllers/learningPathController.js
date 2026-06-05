import Course from "../models/Course.js";
import LearningPath from "../models/LearningPath.js";
import { recalculateUserSkills } from "../utils/skillTrackingHelper.js";

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getCourseSkills = (course) => {
  const skills = [];

  if (course.category) {
    skills.push(course.category);
  }

  if (Array.isArray(course.skills)) {
    skills.push(...course.skills);
  }

  return skills.map(normalize).filter(Boolean);
};

const buildRecommendedCourses = ({
  courses,
  weakSkills,
  enrolledCourseIds,
}) => {
  return courses
    .filter((course) => !enrolledCourseIds.has(course._id.toString()))
    .map((course) => {
      const courseSkills = getCourseSkills(course);

      const matchedWeakSkills = weakSkills.filter((skill) =>
        courseSkills.some((courseSkill) => courseSkill.includes(skill)),
      );

      const priority = Math.min(5, Math.max(1, matchedWeakSkills.length + 1));

      return {
        course,
        reason:
          matchedWeakSkills.length > 0
            ? `Recommended because it improves: ${matchedWeakSkills.join(", ")}`
            : `Recommended for your ${course.category || "technical"} learning path.`,
        priority,
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8);
};

export const generateLearningPath = async (req, res) => {
  try {
    const { targetRole = "Full Stack Developer" } = req.body;

    const skillProfile = await recalculateUserSkills(req.user._id);

    const currentSkillsSnapshot = (skillProfile.skills || []).map((skill) => ({
      name: skill.name,
      progress: skill.progress,
    }));

    const weakSkills = currentSkillsSnapshot
      .filter((skill) => skill.progress < 70)
      .map((skill) => normalize(skill.name));

    const courses = await Course.find({
      status: "published",
    }).populate("instructor", "name email");

    const enrolledCourses = await Course.find({
      students: req.user._id,
    }).select("_id");

    const enrolledCourseIds = new Set(
      enrolledCourses.map((course) => course._id.toString()),
    );

    const recommendedCourses = buildRecommendedCourses({
      courses,
      weakSkills,
      enrolledCourseIds,
    });

    const nextSteps =
      weakSkills.length > 0
        ? [
            `Improve weak skills: ${weakSkills.join(", ")}`,
            "Complete recommended courses in priority order.",
            "Pass quizzes and generate certificates to strengthen your profile.",
          ]
        : [
            "Continue advanced courses related to your target role.",
            "Build portfolio projects from completed courses.",
            "Practice interview questions for your role.",
          ];

    const learningPath = await LearningPath.create({
      user: req.user._id,
      targetRole: targetRole.trim(),
      currentSkillsSnapshot,
      weakSkills,
      recommendedCourses: recommendedCourses.map((item) => ({
        course: item.course._id,
        reason: item.reason,
        priority: item.priority,
      })),
      nextSteps,
    });

    const populatedPath = await LearningPath.findById(
      learningPath._id,
    ).populate(
      "recommendedCourses.course",
      "title description category level price thumbnail averageRating numReviews",
    );

    return res.status(201).json({
      success: true,
      message: "Learning path generated successfully",
      learningPath: populatedPath,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate learning path",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const getMyLearningPaths = async (req, res) => {
  try {
    const learningPaths = await LearningPath.find({
      user: req.user._id,
    })
      .populate(
        "recommendedCourses.course",
        "title description category level price thumbnail averageRating numReviews",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: learningPaths.length,
      learningPaths,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch learning paths",
    });
  }
};

export const deleteLearningPath = async (req, res) => {
  try {
    const learningPath = await LearningPath.findOneAndDelete({
      _id: req.params.pathId,
      user: req.user._id,
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Learning path deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete learning path",
    });
  }
};
