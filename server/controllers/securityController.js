import AuditLog from "../models/AuditLog.js";
import LoginHistory from "../models/LoginHistory.js";
import DeviceSession from "../models/DeviceSession.js";

export const getSecurityDashboard = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      failedLogins24h,
      successfulLogins24h,
      activeSessions,
      expiredSessions,
      auditLogs24h,
      recentFailedLogins,
      recentAuditLogs,
      topFailedLoginEmails,
    ] = await Promise.all([
      LoginHistory.countDocuments({
        status: "failed",
        createdAt: { $gte: last24Hours },
      }),

      LoginHistory.countDocuments({
        status: "success",
        createdAt: { $gte: last24Hours },
      }),

      DeviceSession.countDocuments({
        isActive: true,
        expiresAt: { $gt: new Date() },
      }),

      DeviceSession.countDocuments({
        expiresAt: { $lte: new Date() },
      }),

      AuditLog.countDocuments({
        createdAt: { $gte: last24Hours },
      }),

      LoginHistory.find({
        status: "failed",
        createdAt: { $gte: last7Days },
      })
        .sort({ createdAt: -1 })
        .limit(10),

      AuditLog.find()
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .limit(20),

      LoginHistory.aggregate([
        {
          $match: {
            status: "failed",
            createdAt: { $gte: last7Days },
          },
        },
        {
          $group: {
            _id: "$email",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      security: {
        summary: {
          failedLogins24h,
          successfulLogins24h,
          activeSessions,
          expiredSessions,
          auditLogs24h,
        },
        recentFailedLogins,
        recentAuditLogs,
        topFailedLoginEmails: topFailedLoginEmails.map((item) => ({
          email: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch security dashboard",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { action = "", status = "", page = 1, limit = 20 } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = {};

    if (action) filter.action = action;
    if (status) filter.status = status;

    const logs = await AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalLogs = await AuditLog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalLogs / limitNumber),
      totalLogs,
      count: logs.length,
      logs,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};

export const getLoginSecurityLogs = async (req, res) => {
  try {
    const { status = "", page = 1, limit = 20 } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = {};
    if (status) filter.status = status;

    const logs = await LoginHistory.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalLogs = await LoginHistory.countDocuments(filter);

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalLogs / limitNumber),
      totalLogs,
      count: logs.length,
      logs,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch login security logs",
    });
  }
};
