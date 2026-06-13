import AuditLog from "../models/AuditLog.js";

export const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
};

export const createAuditLog = async ({
  req,
  action,
  resourceType = "",
  resourceId = "",
  status = "success",
  message = "",
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actor: req.user?._id || null,
      actorRole: req.user?.role || "",
      action,
      resourceType,
      resourceId,
      status,
      message,
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"] || "",
      metadata,
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};
