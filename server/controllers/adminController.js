import User from "../models/User.js";
import Course from "../models/Course.js";
import Order from "../models/Order.js";
import Certificate from "../models/Certificate.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

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

      Certificate.countDocuments({ status: "active" }),

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
      .select("name email role avatar isEmailVerified createdAt learningStreak")
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
        returnDocument: "after",
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

export const getAdminUserAnalytics = async (req, res) => {
  try {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      verifiedUsers,
      unverifiedUsers,
      usersThisMonth,
      usersLast7Days,
      activeQuizUsers,
      recentUsers,
      roleDistribution,
      dailyRegistrations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "instructor" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ isEmailVerified: false }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

      QuizAttempt.distinct("user", {
        createdAt: { $gte: thirtyDaysAgo },
      }),

      User.find()
        .select("name email role avatar isEmailVerified createdAt")
        .sort({ createdAt: -1 })
        .limit(10),

      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),

      User.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
    ]);

    const roleCounts = {
      student: 0,
      instructor: 0,
      admin: 0,
    };

    roleDistribution.forEach((item) => {
      roleCounts[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totals: {
          totalUsers,
          totalStudents,
          totalInstructors,
          totalAdmins,
          verifiedUsers,
          unverifiedUsers,
        },
        growth: {
          usersThisMonth,
          usersLast7Days,
          dailyRegistrations: dailyRegistrations.map((item) => ({
            date: item._id,
            count: item.count,
          })),
        },
        engagement: {
          activeQuizUsersLast30Days: activeQuizUsers.length,
        },
        roleDistribution: roleCounts,
        recentUsers,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch user analytics", error);
  }
};

export const getAdminCourseAnalytics = async (req, res) => {
  try {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalCourses,
      publishedCourses,
      draftCourses,
      freeCourses,
      paidCourses,
      coursesThisMonth,
      coursesLast7Days,
      categoryDistribution,
      levelDistribution,
      topEnrolledCourses,
      recentCourses,
    ] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Course.countDocuments({ status: "draft" }),
      Course.countDocuments({ price: 0 }),
      Course.countDocuments({ price: { $gt: 0 } }),
      Course.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Course.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

      Course.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Course.aggregate([
        {
          $group: {
            _id: "$level",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Course.aggregate([
        {
          $project: {
            title: 1,
            category: 1,
            level: 1,
            status: 1,
            studentCount: {
              $size: {
                $ifNull: ["$students", []],
              },
            },
          },
        },
        { $sort: { studentCount: -1 } },
        { $limit: 10 },
      ]),

      Course.find()
        .populate("instructor", "name email")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totals: {
          totalCourses,
          publishedCourses,
          draftCourses,
          freeCourses,
          paidCourses,
        },
        growth: {
          coursesThisMonth,
          coursesLast7Days,
        },
        categoryDistribution: categoryDistribution.map((item) => ({
          category: item._id || "uncategorized",
          count: item.count,
        })),
        levelDistribution: levelDistribution.map((item) => ({
          level: item._id || "unknown",
          count: item.count,
        })),
        topEnrolledCourses,
        recentCourses,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch course analytics", error);
  }
};

export const getAdminRevenueAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [paidOrders, recentRevenue, revenueByCourse] = await Promise.all([
      Order.find({ status: "paid" }),

      Order.aggregate([
        {
          $match: {
            status: "paid",
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Order.aggregate([
        {
          $match: {
            status: "paid",
          },
        },
        {
          $group: {
            _id: "$course",
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $unwind: {
            path: "$course",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]),
    ]);

    const totalRevenue = paidOrders.reduce(
      (total, order) => total + Number(order.amount || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalPaidOrders: paidOrders.length,
        averageOrderValue:
          paidOrders.length === 0
            ? 0
            : Math.round(totalRevenue / paidOrders.length),
        revenueLast30Days: recentRevenue.map((item) => ({
          date: item._id,
          revenue: item.revenue,
          orders: item.orders,
        })),
        topRevenueCourses: revenueByCourse.map((item) => ({
          courseId: item._id,
          title: item.course?.title || "Deleted course",
          revenue: item.revenue,
          orders: item.orders,
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch revenue analytics", error);
  }
};

export const getAdminEnrollmentAnalytics = async (req, res) => {
  try {
    const [totalEnrollmentData, topCourses, zeroEnrollmentCourses] =
      await Promise.all([
        Course.aggregate([
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
              totalEnrollments: { $sum: "$studentCount" },
              averageEnrollments: { $avg: "$studentCount" },
            },
          },
        ]),

        Course.aggregate([
          {
            $project: {
              title: 1,
              category: 1,
              level: 1,
              status: 1,
              studentCount: {
                $size: {
                  $ifNull: ["$students", []],
                },
              },
            },
          },
          { $sort: { studentCount: -1 } },
          { $limit: 10 },
        ]),

        Course.aggregate([
          {
            $project: {
              title: 1,
              status: 1,
              studentCount: {
                $size: {
                  $ifNull: ["$students", []],
                },
              },
            },
          },
          {
            $match: {
              studentCount: 0,
            },
          },
          { $limit: 10 },
        ]),
      ]);

    const summary = totalEnrollmentData[0] || {
      totalEnrollments: 0,
      averageEnrollments: 0,
    };

    return res.status(200).json({
      success: true,
      analytics: {
        totalEnrollments: summary.totalEnrollments || 0,
        averageEnrollments: Math.round(summary.averageEnrollments || 0),
        topCourses,
        zeroEnrollmentCourses,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch enrollment analytics", error);
  }
};

export const getAdminQuizAnalytics = async (req, res) => {
  try {
    const [
      totalQuizzes,
      publishedQuizzes,
      draftQuizzes,
      totalAttempts,
      passedAttempts,
      failedAttempts,
      averageScoreData,
      topAttemptedQuizzes,
    ] = await Promise.all([
      Quiz.countDocuments(),
      Quiz.countDocuments({ status: "published" }),
      Quiz.countDocuments({ status: "draft" }),
      QuizAttempt.countDocuments({ status: "submitted" }),
      QuizAttempt.countDocuments({ status: "submitted", passed: true }),
      QuizAttempt.countDocuments({ status: "submitted", passed: false }),

      QuizAttempt.aggregate([
        {
          $match: {
            status: "submitted",
          },
        },
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$percentage" },
          },
        },
      ]),

      QuizAttempt.aggregate([
        {
          $match: {
            status: "submitted",
          },
        },
        {
          $group: {
            _id: "$quiz",
            attempts: { $sum: 1 },
            averageScore: { $avg: "$percentage" },
          },
        },
        { $sort: { attempts: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "quizzes",
            localField: "_id",
            foreignField: "_id",
            as: "quiz",
          },
        },
        {
          $unwind: {
            path: "$quiz",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalQuizzes,
        publishedQuizzes,
        draftQuizzes,
        totalAttempts,
        passedAttempts,
        failedAttempts,
        passRate:
          totalAttempts === 0
            ? 0
            : Math.round((passedAttempts / totalAttempts) * 100),
        averageScore: Math.round(averageScoreData[0]?.averageScore || 0),
        topAttemptedQuizzes: topAttemptedQuizzes.map((item) => ({
          quizId: item._id,
          title: item.quiz?.title || "Deleted quiz",
          attempts: item.attempts,
          averageScore: Math.round(item.averageScore || 0),
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch quiz analytics", error);
  }
};

export const getAdminCertificateAnalytics = async (req, res) => {
  try {
    const [
      totalCertificates,
      activeCertificates,
      revokedCertificates,
      topCourses,
    ] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ status: "active" }),
      Certificate.countDocuments({ status: "revoked" }),

      Certificate.aggregate([
        {
          $group: {
            _id: "$course",
            certificates: { $sum: 1 },
          },
        },
        { $sort: { certificates: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $unwind: {
            path: "$course",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalCertificates,
        activeCertificates,
        revokedCertificates,
        topCertificateCourses: topCourses.map((item) => ({
          courseId: item._id,
          title: item.course?.title || "Deleted course",
          certificates: item.certificates,
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch certificate analytics", error);
  }
};

export const getAdminPlatformMonitoring = async (req, res) => {
  try {
    const [
      latestUsers,
      latestCourses,
      latestOrders,
      latestCertificates,
      latestQuizAttempts,
    ] = await Promise.all([
      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5),

      Course.find()
        .populate("instructor", "name email")
        .sort({ createdAt: -1 })
        .limit(5),

      Order.find()
        .populate("user", "name email")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(5),

      Certificate.find()
        .populate("user", "name email")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(5),

      QuizAttempt.find()
        .populate("user", "name email")
        .populate("quiz", "title")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      monitoring: {
        latestUsers,
        latestCourses,
        latestOrders,
        latestCertificates,
        latestQuizAttempts,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch platform monitoring", error);
  }
};

export const updateUserVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isEmailVerified } = req.body;

    if (typeof isEmailVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isEmailVerified must be true or false",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isEmailVerified,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("name email role avatar isEmailVerified createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isEmailVerified
        ? "User marked as verified"
        : "User marked as unverified",
      user,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update user verification", error);
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Promise.all([
      QuizAttempt.deleteMany({ user: userId }),
      Order.deleteMany({ user: userId }),
      Certificate.deleteMany({ user: userId }),
      Course.updateMany(
        {
          students: userId,
        },
        {
          $pull: {
            students: userId,
          },
        },
      ),
      Course.updateMany(
        {
          "reviews.user": userId,
        },
        {
          $pull: {
            reviews: {
              user: userId,
            },
          },
        },
      ),
    ]);

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, "Failed to delete user", error);
  }
};

export const updateAdminCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course status",
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        status,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        status === "published"
          ? "Course published successfully"
          : "Course moved to draft",
      course,
    });
  } catch (error) {
    return sendServerError(res, "Failed to update course status", error);
  }
};

export const deleteAdminCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Promise.all([
      Quiz.deleteMany({ course: courseId }),
      QuizAttempt.deleteMany({ course: courseId }),
      Order.deleteMany({ course: courseId }),
      Certificate.deleteMany({ course: courseId }),
    ]);

    await course.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, "Failed to delete course", error);
  }
};
