import mongoose from "mongoose";
import Course from "../models/Course.js";

/**
 * POST /api/courses
 * Create a new course (instructor/admin only).
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "title, description, price, and category are required",
      });
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "price must be a valid non-negative number",
      });
    }

    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      instructor: req.user._id,
    });

    const createdCourse = await Course.findById(course._id).populate("instructor", "name email");

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: createdCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

/**
 * GET /api/courses
 * Get all courses (public).
 */
export const getAllCourses = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;

    let filter = {};

    // 🔹 Category filter
    if (category) {
      filter.category = category;
    }

    // 🔹 Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 🔹 Search filter (title)
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/**
 * GET /api/courses/:id
 * Get a single course by ID (public).
 */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await Course.findById(id).populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

/**
 * POST /api/courses/:id/enroll
 * Enroll current student in a course (student only).
 */
export const enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await Course.findById(id).populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const alreadyEnrolled = course.students.some(
      (studentId) => studentId.toString() === req.user._id.toString(),
    );

    if (alreadyEnrolled) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in this course",
      });
    }

    course.students.push(req.user._id);
    await course.save();

    const updatedCourse = await Course.findById(id).populate("instructor", "name email");

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      course: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to enroll in course",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

