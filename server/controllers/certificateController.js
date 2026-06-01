import Certificate from "../models/Certificate.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";
import { createActivity, createNotification } from "../utils/activityHelper.js";

const getTotalLessons = (course) => {
  return (course.sections || []).reduce((total, section) => {
    return total + (section.lessons?.length || 0);
  }, 0);
};

const sendServerError = (res, message, error) => {
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
};

const getStudentName = async (user) => {
  const student = await User.findById(user._id).select("name email");

  return (
    student?.name ||
    user.name ||
    student?.email?.split("@")[0] ||
    user.email?.split("@")[0] ||
    "Student"
  );
};

const checkCertificateEligibility = async (userId, courseId) => {
  const course = await Course.findById(courseId).populate(
    "instructor",
    "name email",
  );

  if (!course) {
    return {
      eligible: false,
      status: 404,
      message: "Course not found",
    };
  }

  const progress = await Progress.findOne({
    user: userId,
    course: courseId,
  });

  const totalLessons = getTotalLessons(course);
  const completedLessons = progress?.completedLessons?.length || 0;

  const completionPercentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  if (completionPercentage < 100) {
    return {
      eligible: false,
      status: 400,
      message: "Complete all lessons before generating certificate",
      completionPercentage,
      course,
    };
  }

  const publishedQuizzes = await Quiz.find({
    course: courseId,
    status: "published",
  });

  for (const quiz of publishedQuizzes) {
    const passedAttempt = await QuizAttempt.findOne({
      user: userId,
      quiz: quiz._id,
      passed: true,
    });

    if (!passedAttempt) {
      return {
        eligible: false,
        status: 400,
        message: `Pass quiz "${quiz.title}" before generating certificate`,
        completionPercentage,
        course,
      };
    }
  }

  return {
    eligible: true,
    course,
    completionPercentage,
    quizPassed: true,
  };
};

export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const existingCertificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId,
      status: "active",
    });

    const studentName = await getStudentName(req.user);

    if (existingCertificate) {
      if (
        (!existingCertificate.studentName ||
          existingCertificate.studentName === "Student") &&
        studentName
      ) {
        existingCertificate.studentName = studentName;
        await existingCertificate.save();
      }

      return res.status(200).json({
        success: true,
        message: "Certificate already generated",
        certificate: existingCertificate,
      });
    }

    const eligibility = await checkCertificateEligibility(
      req.user._id,
      courseId,
    );

    if (!eligibility.eligible) {
      return res.status(eligibility.status || 400).json({
        success: false,
        message: eligibility.message,
        completionPercentage: eligibility.completionPercentage || 0,
      });
    }

    const certificate = await Certificate.create({
      user: req.user._id,
      course: courseId,
      studentName,
      courseTitle: eligibility.course.title,
      instructorName: eligibility.course.instructor?.name || "",
      completionPercentage: eligibility.completionPercentage,
      quizPassed: eligibility.quizPassed,
    });

    certificate.verificationUrl = `/certificates/verify/${certificate.certificateId}`;
    await certificate.save();

    await createActivity({
      user: req.user._id,
      role: "student",
      type: "certificate_generated",
      title: "Certificate Generated",
      message: `Generated certificate for ${eligibility.course.title}`,
      course: eligibility.course._id,
    });

    await createNotification({
      recipient: req.user._id,
      type: "certificate_generated",
      title: "Certificate Ready",
      message: `Certificate generated for ${eligibility.course.title}`,
      course: eligibility.course._id,
    });

    return res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      certificate,
    });
  } catch (error) {
    return sendServerError(res, "Failed to generate certificate", error);
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      user: req.user._id,
    })
      .populate("course", "title category level")
      .sort({ issuedAt: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch certificates", error);
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({
      certificateId,
      status: "active",
    }).populate("course", "title category level");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or revoked",
      });
    }

    return res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    return sendServerError(res, "Failed to verify certificate", error);
  }
};
