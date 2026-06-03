import User from "../models/User.js";
import Course from "../models/Course.js";
import Order from "../models/Order.js";
import Certificate from "../models/Certificate.js";

const sendServerError = (res, message, error) => {
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
};

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      publishedCourses,
      draftCourses,
      paidOrders,
      freeOrders,
      certificatesIssued,
      recentUsers,
      recentCourses,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "instructor" }),
      User.countDocuments({ role: "admin" }),

      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Course.countDocuments({ status: "draft" }),

      Order.find({ status: "paid" }),
      Order.countDocuments({ paymentProvider: "free", status: "paid" }),

      Certificate.countDocuments({ status: "issued" }),

      User.find()
        .select("name email role avatar createdAt")
        .sort({ createdAt: -1 })
        .limit(6),

      Course.find()
        .populate("instructor", "name email")
        .sort({ createdAt: -1 })
        .limit(6),

      Order.find({ status: "paid" })
        .populate("user", "name email")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const totalRevenue = paidOrders.reduce(
      (total, order) => total + Number(order.amount || 0),
      0,
    );

    const paidEnrollments = paidOrders.length;

    const totalEnrollments = await Course.aggregate([
      {
        $project: {
          studentCount: {
            $size: {
              $ifNull: ["$students", []],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$studentCount",
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        paidEnrollments,
        freeEnrollments: freeOrders,
        totalRevenue,
        certificatesIssued,
      },
      recentUsers,
      recentCourses,
      recentOrders,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch admin dashboard", error);
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { search = "", role = "", page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          email: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const users = await User.find(filter)
      .select("name email role avatar createdAt learningStreak")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalUsers = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalUsers / limitNumber),
      totalUsers,
      count: users.length,
      users,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch users", error);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (userId === req.user._id.toString() && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        role,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("name email role avatar createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update user role", error);
  }
};

export const getAdminCourses = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          category: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .sort({ createdAt: -1 })
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
    return sendServerError(res, "Failed to fetch admin courses", error);
  }
};
