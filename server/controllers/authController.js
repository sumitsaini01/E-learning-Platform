import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary.js";

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

const getCloudinaryPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return "";

  const parts = url.split("/upload/");
  if (parts.length < 2) return "";

  const pathWithVersion = parts[1];
  const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, "");
  const publicIdWithExtension = pathWithoutVersion.split(".")[0];

  return publicIdWithExtension;
};

// ✅ REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        learningStreak: user.learningStreak,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

// ✅ LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        learningStreak: user.learningStreak,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

// ✅ FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your SkillSphere password.</p>
        <p>Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#047857;color:white;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your SkillSphere password",
        html,
      });

      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent. Please try again.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process forgot password request",
    });
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    // Hash incoming token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find valid user
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

// ✅ PROFILE
export const getUserProfile = async (req, res) => {
  res.json({
    user: req.user,
  });
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (avatar !== undefined && avatar.trim() !== user.avatar) {
      const oldAvatarPublicId = getCloudinaryPublicIdFromUrl(user.avatar);

      if (oldAvatarPublicId) {
        await cloudinary.uploader.destroy(oldAvatarPublicId);
      }

      user.avatar = avatar.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        learningStreak: user.learningStreak,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = Date.now();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
