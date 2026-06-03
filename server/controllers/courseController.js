import mongoose from "mongoose";
import Course from "../models/Course.js";
import User from "../models/User.js";
import QuizAttempt from "../models/QuizAttempt.js";
import AiStudyResource from "../models/AiStudyResource.js";
import {
  generateCourseDescriptionWithAI,
  generateFlashcardsWithAI,
  generateStudyNotesWithAI,
} from "../services/aiQuizService.js";
import sendEmail from "../utils/sendEmail.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const validateCourseInput = ({ title, description, price, category }) => {
  if (
    !title?.trim() ||
    !description?.trim() ||
    price === undefined ||
    !category?.trim()
  ) {
    return "title, description, price, and category are required";
  }

  if (Number.isNaN(Number(price)) || Number(price) < 0) {
    return "price must be a valid non-negative number";
  }

  return null;
};

const buildCoursePayload = ({
  title,
  description,
  price,
  category,
  thumbnail,
  level,
  status,
}) => ({
  title: title.trim(),
  description: description.trim(),
  price: Number(price),
  category: category.trim().toLowerCase(),
  thumbnail: thumbnail?.trim() || "",
  level: level || "beginner",
  status: status || "published",
});

const sendServerError = (res, message, error) => {
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
};

const validateCourseOwnership = (course, user) => {
  if (!course) return { status: 404, message: "Course not found" };

  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    return { status: 403, message: "Not authorized to manage this course" };
  }

  return null;
};

const getManagedCourse = async (courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) return null;
  return Course.findById(courseId);
};

export const generateCourseDescription = async (req, res) => {
  try {
    const {
      title,
      category = "",
      level = "beginner",
      targetAudience = "",
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course title is required",
      });
    }

    const generated = await generateCourseDescriptionWithAI({
      title,
      category,
      level,
      targetAudience,
    });

    return res.status(200).json({
      success: true,
      message: "Course description generated successfully",
      ...generated,
    });
  } catch (error) {
    console.error("AI course description error:", error.message);
    return sendServerError(res, "Failed to generate course description", error);
  }
};

export const generateStudyNotes = async (req, res) => {
  try {
    const { id: courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isInstructor =
      course.instructor.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    const isStudent =
      req.user.role === "student" &&
      course.students.some(
        (studentId) => studentId.toString() === req.user._id.toString(),
      );

    if (!isInstructor && !isAdmin && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to generate study notes",
      });
    }

    const notes = await generateStudyNotesWithAI({
      courseTitle: course.title,
      courseDescription: course.description,
      category: course.category,
      level: course.level,
      sections: course.sections || [],
    });

    const resource = await AiStudyResource.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
        type: "study_notes",
      },
      {
        notes,
        flashcards: [],
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Study notes generated and saved successfully",
      notes: resource.notes,
    });
  } catch (error) {
    return sendServerError(res, "Failed to generate study notes", error);
  }
};

export const generateFlashcards = async (req, res) => {
  try {
    const { id: courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isInstructor =
      course.instructor.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    const isStudent =
      req.user.role === "student" &&
      course.students.some(
        (studentId) => studentId.toString() === req.user._id.toString(),
      );

    if (!isInstructor && !isAdmin && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to generate flashcards",
      });
    }

    const flashcards = await generateFlashcardsWithAI({
      courseTitle: course.title,
      courseDescription: course.description,
      category: course.category,
      level: course.level,
      sections: course.sections || [],
    });

    const resource = await AiStudyResource.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
        type: "flashcards",
      },
      {
        notes: {},
        flashcards,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Flashcards generated and saved successfully",
      flashcards: resource.flashcards,
    });
  } catch (error) {
    return sendServerError(res, "Failed to generate flashcards", error);
  }
};

export const getAiStudyResources = async (req, res) => {
  try {
    const { id: courseId } = req.params;

    const resources = await AiStudyResource.find({
      user: req.user._id,
      course: courseId,
    });

    const notesResource = resources.find(
      (resource) => resource.type === "study_notes",
    );

    const flashcardsResource = resources.find(
      (resource) => resource.type === "flashcards",
    );

    return res.status(200).json({
      success: true,
      notes: notesResource?.notes || null,
      flashcards: flashcardsResource?.flashcards || [],
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch AI study resources", error);
  }
};

export const createCourse = async (req, res) => {
  try {
    const validationError = validateCourseInput(req.body);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const course = await Course.create({
      ...buildCoursePayload(req.body),
      instructor: req.user._id,
    });

    const populatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "name email",
    );

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (error) {
    return sendServerError(res, "Failed to create course", error);
  }
};

export const getCourses = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      priceType,
      minRating,
      search,
      level,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { status: "published" };
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

    if (category?.trim()) {
      const safeCategory = escapeRegex(category.trim().toLowerCase());

      filter.category = {
        $regex: safeCategory,
        $options: "i",
      };
    }

    if (level) {
      filter.level = level;
    }

    if (priceType === "free") {
      filter.price = 0;
    } else if (priceType === "paid") {
      filter.price = { $gt: 0 };
    } else if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (minRating) {
      filter.averageRating = {
        $gte: Number(minRating),
      };
    }

    if (search?.trim()) {
      const searchText = search.trim();
      const safeSearchText = escapeRegex(searchText);

      const matchingInstructors = await User.find({
        name: { $regex: safeSearchText, $options: "i" },
      }).select("_id");

      const instructorIds = matchingInstructors.map(
        (instructor) => instructor._id,
      );

      filter.$or = [
        { title: { $regex: safeSearchText, $options: "i" } },
        { description: { $regex: safeSearchText, $options: "i" } },
        { category: { $regex: safeSearchText, $options: "i" } },
        ...(instructorIds.length > 0
          ? [{ instructor: { $in: instructorIds } }]
          : []),
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      "highest-rated": { averageRating: -1, numReviews: -1 },
      popular: { students: -1, averageRating: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .sort(sortBy)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalCourses = await Course.countDocuments(filter);

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCourses / limitNumber),
      totalCourses,
      count: courses.length,
      courses,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch courses", error);
  }
};

export const getAllCourses = getCourses;

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course id" });
    }

    const course = await Course.findById(id).populate(
      "instructor",
      "name email",
    );

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({ success: true, course });
  } catch (error) {
    return sendServerError(res, "Failed to fetch course", error);
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course id" });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const alreadyEnrolled = course.students.some(
      (studentId) => studentId.toString() === req.user._id.toString(),
    );

    if (alreadyEnrolled) {
      return res.status(409).json({
        success: false,
        message: "Student already enrolled in this course",
      });
    }

    await Course.findByIdAndUpdate(id, {
      $addToSet: { students: req.user._id },
    });

    const updatedCourse = await Course.findById(id).populate(
      "instructor",
      "name email",
    );

    try {
      await sendEmail({
        to: req.user.email,
        subject: `You are enrolled in ${updatedCourse.title}`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Course Enrollment Successful</h2>
        <p>Hello ${req.user.name || "Student"},</p>
        <p>You have successfully enrolled in <strong>${updatedCourse.title}</strong>.</p>
        <p>You can now start learning from your SkillSphere dashboard.</p>
      </div>
    `,
      });
    } catch (emailError) {
      console.error("Course enrollment email failed:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      course: updatedCourse,
    });
  } catch (error) {
    return sendServerError(res, "Failed to enroll in course", error);
  }
};

export const getStudentEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      students: req.user._id,
      status: "published",
    })
      .populate("instructor", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch enrolled courses", error);
  }
};

export const saveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await Course.findOne({
      _id: id,
      status: "published",
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          savedCourses: course._id,
        },
      },
      {
        new: true,
      },
    ).populate({
      path: "savedCourses",
      populate: {
        path: "instructor",
        select: "name email",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Course saved successfully",
      savedCourses: user.savedCourses,
    });
  } catch (error) {
    return sendServerError(res, "Failed to save course", error);
  }
};

export const removeSavedCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          savedCourses: id,
        },
      },
      {
        new: true,
      },
    ).populate({
      path: "savedCourses",
      populate: {
        path: "instructor",
        select: "name email",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Course removed from saved list",
      savedCourses: user.savedCourses,
    });
  } catch (error) {
    return sendServerError(res, "Failed to remove saved course", error);
  }
};

export const getSavedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedCourses",
      match: {
        status: "published",
      },
      populate: {
        path: "instructor",
        select: "name email",
      },
    });

    return res.status(200).json({
      success: true,
      count: user.savedCourses.length,
      courses: user.savedCourses,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch saved courses", error);
  }
};

export const getRecommendedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("savedCourses");

    const enrolledCourses = await Course.find({
      students: req.user._id,
    }).select("_id category level");

    const enrolledCourseIds = enrolledCourses.map((course) => course._id);

    const savedCourseIds = user?.savedCourses || [];

    const preferredCategories = [
      ...new Set(enrolledCourses.map((course) => course.category)),
    ];

    const preferredLevels = [
      ...new Set(enrolledCourses.map((course) => course.level)),
    ];

    const excludedCourseIds = [...enrolledCourseIds, ...savedCourseIds];

    const filter = {
      status: "published",
      _id: {
        $nin: excludedCourseIds,
      },
    };

    if (preferredCategories.length > 0) {
      filter.category = {
        $in: preferredCategories,
      };
    }

    const recommendations = await Course.find(filter)
      .populate("instructor", "name email")
      .sort({
        averageRating: -1,
        numReviews: -1,
        createdAt: -1,
      })
      .limit(6);

    let fallbackCourses = [];

    if (recommendations.length < 6) {
      fallbackCourses = await Course.find({
        status: "published",
        _id: {
          $nin: [
            ...excludedCourseIds,
            ...recommendations.map((course) => course._id),
          ],
        },
      })
        .populate("instructor", "name email")
        .sort({
          averageRating: -1,
          numReviews: -1,
          createdAt: -1,
        })
        .limit(6 - recommendations.length);
    }

    const courses = [...recommendations, ...fallbackCourses].map((course) => {
      const matchedCategory = preferredCategories.includes(course.category);
      const matchedLevel = preferredLevels.includes(course.level);

      return {
        ...course.toObject(),
        recommendationReason: matchedCategory
          ? `Because you are learning ${course.category}`
          : matchedLevel
            ? `Based on your ${course.level} level courses`
            : "Popular course you may like",
      };
    });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch recommended courses", error);
  }
};
export const getInstructorAnalytics = async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: req.user._id,
    }).sort({ createdAt: -1 });

    const courseIds = courses.map((course) => course._id);

    const quizAttempts = await QuizAttempt.find({
      course: { $in: courseIds },
      status: "submitted",
    })
      .populate("quiz", "title")
      .populate("course", "title")
      .sort({ submittedAt: -1 });

    const totalCourses = courses.length;
    const publishedCourses = courses.filter(
      (course) => course.status === "published",
    ).length;
    const draftCourses = courses.filter(
      (course) => course.status === "draft",
    ).length;

    const totalStudents = courses.reduce(
      (total, course) => total + course.students.length,
      0,
    );

    const totalRevenue = courses.reduce(
      (total, course) =>
        total + course.students.length * Number(course.price || 0),
      0,
    );

    const totalReviews = courses.reduce(
      (total, course) => total + Number(course.numReviews || 0),
      0,
    );

    const averageRating =
      totalReviews === 0
        ? 0
        : Number(
            (
              courses.reduce(
                (total, course) =>
                  total +
                  Number(course.averageRating || 0) *
                    Number(course.numReviews || 0),
                0,
              ) / totalReviews
            ).toFixed(1),
          );

    const topCourse =
      courses
        .map((course) => ({
          id: course._id,
          title: course.title,
          students: course.students.length,
          revenue: course.students.length * Number(course.price || 0),
          averageRating: course.averageRating || 0,
          numReviews: course.numReviews || 0,
        }))
        .sort((a, b) => b.students - a.students)[0] || null;

    const coursePerformance = courses.map((course) => {
      const attemptsForCourse = quizAttempts.filter(
        (attempt) => attempt.course?._id?.toString() === course._id.toString(),
      );

      const passedAttempts = attemptsForCourse.filter(
        (attempt) => attempt.passed,
      ).length;

      const averageQuizScore =
        attemptsForCourse.length === 0
          ? 0
          : Math.round(
              attemptsForCourse.reduce(
                (total, attempt) => total + Number(attempt.percentage || 0),
                0,
              ) / attemptsForCourse.length,
            );

      return {
        id: course._id,
        title: course.title,
        status: course.status,
        category: course.category,
        level: course.level,
        students: course.students.length,
        revenue: course.students.length * Number(course.price || 0),
        averageRating: course.averageRating || 0,
        numReviews: course.numReviews || 0,
        quizAttempts: attemptsForCourse.length,
        quizPassRate:
          attemptsForCourse.length === 0
            ? 0
            : Math.round((passedAttempts / attemptsForCourse.length) * 100),
        averageQuizScore,
      };
    });

    const quizAnalytics = {
      totalAttempts: quizAttempts.length,
      passedAttempts: quizAttempts.filter((attempt) => attempt.passed).length,
      failedAttempts: quizAttempts.filter((attempt) => !attempt.passed).length,
      averageScore:
        quizAttempts.length === 0
          ? 0
          : Math.round(
              quizAttempts.reduce(
                (total, attempt) => total + Number(attempt.percentage || 0),
                0,
              ) / quizAttempts.length,
            ),
    };

    const recentQuizAttempts = quizAttempts.slice(0, 5).map((attempt) => ({
      id: attempt._id,
      quizTitle: attempt.quiz?.title || "Quiz",
      courseTitle: attempt.course?.title || "Course",
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      passed: attempt.passed,
      submittedAt: attempt.submittedAt,
    }));

    return res.status(200).json({
      success: true,
      summary: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalStudents,
        totalRevenue,
        totalReviews,
        averageRating,
      },
      topCourse,
      coursePerformance,
      quizAnalytics,
      recentQuizAttempts,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch analytics", error);
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      courses: courses.map((course) => ({
        id: course._id,
        title: course.title,
        price: course.price,
        category: course.category,
        level: course.level,
        status: course.status,
        students: course.students.length,
        averageRating: course.averageRating,
        numReviews: course.numReviews,
      })),
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch instructor courses", error);
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course id" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const updatedFields = {};

    if (req.body.title?.trim()) updatedFields.title = req.body.title.trim();

    if (req.body.description?.trim()) {
      updatedFields.description = req.body.description.trim();
    }

    if (req.body.category?.trim()) {
      updatedFields.category = req.body.category.trim().toLowerCase();
    }

    if (req.body.thumbnail !== undefined) {
      updatedFields.thumbnail = req.body.thumbnail?.trim() || "";
    }

    if (req.body.level) updatedFields.level = req.body.level;

    if (req.body.price !== undefined) {
      const price = Number(req.body.price);

      if (Number.isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "price must be a valid non-negative number",
        });
      }

      updatedFields.price = price;
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    }).populate("instructor", "name email");

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update course", error);
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course id" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    await course.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, "Failed to delete course", error);
  }
};

export const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course id" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    course.status = "published";
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course published successfully",
      course,
    });
  } catch (error) {
    return sendServerError(res, "Failed to publish course", error);
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course id" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    course.status = "draft";
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course moved to draft",
      course,
    });
  } catch (error) {
    return sendServerError(res, "Failed to unpublish course", error);
  }
};

export const addSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Section title is required",
      });
    }

    course.sections.push({
      title: title.trim(),
      description: description?.trim() || "",
      order: course.sections.length,
    });

    await course.save();

    return res.status(201).json({
      success: true,
      message: "Section added successfully",
      sections: course.sections,
    });
  } catch (error) {
    return sendServerError(res, "Failed to add section", error);
  }
};

export const addLesson = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const { title, description, videoUrl, duration, isPreviewFree } = req.body;

    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const section = course.sections.id(sectionId);

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Lesson title is required",
      });
    }

    section.lessons.push({
      title: title.trim(),
      description: description?.trim() || "",
      videoUrl: videoUrl?.trim() || "",
      duration: Number(duration) || 0,
      isPreviewFree: Boolean(isPreviewFree),
      order: section.lessons.length,
    });

    await course.save();

    return res.status(201).json({
      success: true,
      message: "Lesson added successfully",
      sections: course.sections,
    });
  } catch (error) {
    return sendServerError(res, "Failed to add lesson", error);
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const section = course.sections.id(sectionId);

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    section.deleteOne();
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      sections: course.sections,
    });
  } catch (error) {
    return sendServerError(res, "Failed to delete section", error);
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id, sectionId, lessonId } = req.params;
    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const section = course.sections.id(sectionId);

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    const lesson = section.lessons.id(lessonId);

    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    lesson.deleteOne();
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
      sections: course.sections,
    });
  } catch (error) {
    return sendServerError(res, "Failed to delete lesson", error);
  }
};

export const updateSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const { title, description } = req.body;

    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const section = course.sections.id(sectionId);

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    if (title !== undefined) section.title = title.trim();
    if (description !== undefined) section.description = description.trim();

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      sections: course.sections,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update section", error);
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id, sectionId, lessonId } = req.params;
    const { title, description, videoUrl, duration, isPreviewFree } = req.body;

    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const section = course.sections.id(sectionId);

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    const lesson = section.lessons.id(lessonId);

    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    if (title !== undefined) lesson.title = title.trim();
    if (description !== undefined) lesson.description = description.trim();
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl.trim();
    if (duration !== undefined) lesson.duration = Number(duration) || 0;
    if (isPreviewFree !== undefined)
      lesson.isPreviewFree = Boolean(isPreviewFree);

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      sections: course.sections,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update lesson", error);
  }
};

export const moveLesson = async (req, res) => {
  try {
    const { id, sectionId, lessonId } = req.params;
    const { targetSectionId } = req.body;

    const course = await getManagedCourse(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const ownershipError = validateCourseOwnership(course, req.user);

    if (ownershipError) {
      return res.status(ownershipError.status).json({
        success: false,
        message: ownershipError.message,
      });
    }

    const sourceSection = course.sections.id(sectionId);
    const targetSection = course.sections.id(targetSectionId);

    if (!sourceSection) {
      return res.status(404).json({
        success: false,
        message: "Source section not found",
      });
    }

    if (!targetSection) {
      return res.status(404).json({
        success: false,
        message: "Target section not found",
      });
    }

    const lesson = sourceSection.lessons.id(lessonId);

    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    const lessonData = lesson.toObject();

    lesson.deleteOne();

    targetSection.lessons.push({
      ...lessonData,
      _id: new mongoose.Types.ObjectId(),
      order: targetSection.lessons.length,
    });

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Lesson moved successfully",
      sections: course.sections,
    });
  } catch (error) {
    return sendServerError(res, "Failed to move lesson", error);
  }
};

const recalculateCourseRating = (course) => {
  course.numReviews = course.reviews.length;

  course.averageRating =
    course.reviews.length === 0
      ? 0
      : course.reviews.reduce((total, review) => total + review.rating, 0) /
        course.reviews.length;
};

export const createCourseReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isEnrolled = course.students.some(
      (studentId) => studentId.toString() === req.user._id.toString(),
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "Only enrolled students can review this course",
      });
    }

    const alreadyReviewed = course.reviews.some(
      (review) => review.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    course.reviews.push({
      user: req.user._id,
      name: req.user.name || req.user.email || "Student",
      rating: Number(rating),
      comment: comment.trim(),
    });

    recalculateCourseRating(course);

    await course.save();

    const updatedCourse = await Course.findById(id).populate(
      "instructor",
      "name email",
    );

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      course: updatedCourse,
    });
  } catch (error) {
    return sendServerError(res, "Failed to add review", error);
  }
};

export const updateCourseReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { rating, comment } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const review = course.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own review",
      });
    }

    if (rating !== undefined) {
      if (Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({
          success: false,
          message: "Review comment is required",
        });
      }

      review.comment = comment.trim();
    }

    recalculateCourseRating(course);

    await course.save();

    const updatedCourse = await Course.findById(id).populate(
      "instructor",
      "name email",
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update review", error);
  }
};

export const deleteCourseReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const review = course.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own review",
      });
    }

    review.deleteOne();

    recalculateCourseRating(course);

    await course.save();

    const updatedCourse = await Course.findById(id).populate(
      "instructor",
      "name email",
    );

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      course: updatedCourse,
    });
  } catch (error) {
    return sendServerError(res, "Failed to delete review", error);
  }
};
