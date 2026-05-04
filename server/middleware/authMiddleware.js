import jwt from "jsonwebtoken";

/**
 * Protect route using JWT from Authorization header.
 * Expects: Authorization: Bearer <token>
 */


export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.toLowerCase().startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token is missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      _id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

/**
 * Role-based authorization middleware.
 */
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. You do not have permission to access this resource.",
    });
  }

  return next();
};

