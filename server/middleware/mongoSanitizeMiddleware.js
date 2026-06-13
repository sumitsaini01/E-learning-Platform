const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  for (const key in obj) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }

    if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }

  return obj;
};

const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);

  next();
};

export default mongoSanitizeMiddleware;
