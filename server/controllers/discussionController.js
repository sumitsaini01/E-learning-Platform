import Course from "../models/Course.js";
import Discussion from "../models/Discussion.js";
import { createNotification } from "../utils/activityHelper.js";

const sendServerError = (res, message, error) => {
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
};

const isStudentEnrolled = (course, userId) => {
  return course.students.some(
    (studentId) => studentId.toString() === userId.toString(),
  );
};

const canAccessCourseDiscussion = (course, user) => {
  if (!course) return false;

  const isInstructor =
    course.instructor.toString() === user._id.toString();

  const isAdmin = user.role === "admin";
  const isEnrolledStudent =
    user.role === "student" && isStudentEnrolled(course, user._id);

  return isInstructor || isAdmin || isEnrolledStudent;
};

export const getCourseDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!canAccessCourseDiscussion(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view discussions for this course",
      });
    }

    const discussions = await Discussion.find({ course: courseId })
      .populate("user", "name email avatar role")
      .populate("replies.user", "name email avatar role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: discussions.length,
      discussions,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch discussions", error);
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, message } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!canAccessCourseDiscussion(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only enrolled students, instructors, or admins can post discussions",
      });
    }

    const discussion = await Discussion.create({
      course: courseId,
      user: req.user._id,
      name: req.user.name || req.user.email || "User",
      title: title.trim(),
      message: message.trim(),
    });

    if (course.instructor.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: course.instructor,
        type: "course_discussion",
        title: "New Course Discussion",
        message: `${req.user.name || "A student"} asked a question in ${course.title}`,
        course: course._id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      discussion,
    });
  } catch (error) {
    return sendServerError(res, "Failed to create discussion", error);
  }
};

export const replyToDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    const course = await Course.findById(discussion.course);

    if (!canAccessCourseDiscussion(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reply to this discussion",
      });
    }

    discussion.replies.push({
      user: req.user._id,
      name: req.user.name || req.user.email || "User",
      role: req.user.role,
      message: message.trim(),
    });

    await discussion.save();

    const shouldNotifyQuestionOwner =
      discussion.user.toString() !== req.user._id.toString();

    if (shouldNotifyQuestionOwner) {
      await createNotification({
        recipient: discussion.user,
        type: "discussion_reply",
        title: "New Reply to Your Discussion",
        message: `${req.user.name || "Someone"} replied to your question in ${course.title}`,
        course: course._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      discussion,
    });
  } catch (error) {
    return sendServerError(res, "Failed to reply to discussion", error);
  }
};

export const toggleDiscussionResolved = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    const course = await Course.findById(discussion.course);

    const isQuestionOwner =
      discussion.user.toString() === req.user._id.toString();

    const isInstructor =
      course?.instructor?.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isQuestionOwner && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this discussion",
      });
    }

    discussion.isResolved = !discussion.isResolved;
    await discussion.save();

    return res.status(200).json({
      success: true,
      message: discussion.isResolved
        ? "Discussion marked as resolved"
        : "Discussion reopened",
      discussion,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update discussion", error);
  }
};