import fs from "fs";
import cloudinary from "../config/cloudinary.js";

const deleteLocalFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const uploadCourseThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail file is required",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "skillsphere/course-thumbnails",
      resource_type: "image",
      transformation: [
        {
          width: 1200,
          height: 675,
          crop: "fill",
          quality: "auto",
        },
      ],
    });

    deleteLocalFile(req.file.path);

    return res.status(200).json({
      success: true,
      message: "Thumbnail uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    deleteLocalFile(req.file?.path);

    return res.status(500).json({
      success: false,
      message: "Failed to upload thumbnail",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar file is required",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "skillsphere/avatars",
      resource_type: "image",
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face",
          quality: "auto",
        },
      ],
    });

    deleteLocalFile(req.file.path);

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    deleteLocalFile(req.file?.path);

    return res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const uploadLessonVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required",
      });
    }

    const result = await cloudinary.uploader.upload_large(req.file.path, {
      folder: "skillsphere/lesson-videos",
      resource_type: "video",
      chunk_size: 20 * 1024 * 1024,
    });

    deleteLocalFile(req.file.path);

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
    });
  } catch (error) {
    deleteLocalFile(req.file?.path);

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload video. If you are using Cloudinary free plan, keep videos under 100MB.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
