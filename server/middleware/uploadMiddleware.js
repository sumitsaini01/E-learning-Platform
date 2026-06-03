import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir = "server/uploads/temp";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    const safeExtension = path.extname(file.originalname).toLowerCase();

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${safeExtension}`;

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".mp4",
  ".webm",
  ".mov",
];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
  const isAllowedExtension = allowedExtensions.includes(extension);

  if (isAllowedMime && isAllowedExtension) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, PNG, WEBP, MP4, WEBM, and MOV files are allowed"),
      false,
    );
  }
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024,
    files: 1,
  },
}).single("file");
