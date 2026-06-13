import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary.js";
import DeviceSession from "../models/DeviceSession.js";
import LoginHistory from "../models/LoginHistory.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getCookieOptions,
  getDeviceName,
  getClientIp,
} from "../utils/tokenUtils.js";

// ✅ REFRESH ACCESS TOKEN
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const session = await DeviceSession.findOne({
      _id: decoded.sessionId,
      user: decoded.id,
      isActive: true,
    }).select("+refreshTokenHash");

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    if (session.expiresAt < new Date()) {
      session.isActive = false;
      await session.save();

      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    const incomingHash = hashToken(refreshToken);

    if (incomingHash !== session.refreshTokenHash) {
      session.isActive = false;
      await session.save();

      return res.status(401).json({
        success: false,
        message: "Refresh token reuse detected. Session revoked.",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, session._id);

    session.refreshTokenHash = hashToken(newRefreshToken);
    session.lastUsedAt = new Date();
    await session.save();

    res.cookie("refreshToken", newRefreshToken, getCookieOptions());

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

// ✅ GET CLOUDINARY PUBLIC ID FROM URL
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

    const allowedPublicRoles = ["student", "instructor"];
    const safeRole = allowedPublicRoles.includes(role) ? role : "student";

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: safeRole,
      isEmailVerified: false,
    });

    const otp = user.getEmailVerificationOtp();

    await user.save({ validateBeforeSave: false });

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your SkillSphere account</h2>
        <p>Hello ${user.name},</p>
        <p>Your email verification OTP is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Verify your SkillSphere email",
      html,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email OTP.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// ✅ VERIFY EMAIL OTP
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      emailVerificationOtp: hashedOtp,
      emailVerificationOtpExpire: { $gt: Date.now() },
    }).select("+emailVerificationOtp +emailVerificationOtpExpire");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

// ✅ RESEND EMAIL OTP
export const resendEmailOtp = async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const otp = user.getEmailVerificationOtp();

    await user.save({ validateBeforeSave: false });

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>SkillSphere Email Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Your new OTP is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Your new SkillSphere OTP",
      html,
    });

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

// ✅ LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const deviceName = getDeviceName(userAgent);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await LoginHistory.create({
        user: user._id,
        email: user.email,
        status: "failed",
        reason: "Invalid password",
        ipAddress,
        userAgent,
        deviceName,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        email: user.email,
        requiresEmailVerification: true,
      });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await DeviceSession.create({
      user: user._id,
      refreshTokenHash: "pending",
      ipAddress,
      userAgent,
      deviceName,
      expiresAt,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, session._id);

    session.refreshTokenHash = hashToken(refreshToken);
    await session.save();

    await LoginHistory.create({
      user: user._id,
      email: user.email,
      status: "success",
      reason: "Login successful",
      ipAddress,
      userAgent,
      deviceName,
    });

    res.cookie("refreshToken", refreshToken, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
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
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
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

// ✅ UPDATE PROFILE
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

// ✅ LEARNING ACTIVITY
export const getLearningActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "learningStreak learningActivity",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const activity = (user.learningActivity || [])
      .map((item) => ({
        date: item.date,
        count: item.count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      success: true,
      learningStreak: user.learningStreak,
      activity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch learning activity",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// ✅ CHANGE PASSWORD
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

    try {
      await sendEmail({
        to: user.email,
        subject: "Your SkillSphere password was changed",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Changed Successfully</h2>
        <p>Hello ${user.name},</p>
        <p>Your SkillSphere account password was changed successfully.</p>
        <p>If you made this change, no further action is needed.</p>
        <p>If you did not change your password, please reset your password immediately.</p>
      </div>
    `,
      });
    } catch (emailError) {
      console.error("Password changed email failed:", emailError.message);
    }

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

// ✅ LOGOUT
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );

        await DeviceSession.findOneAndUpdate(
          {
            _id: decoded.sessionId,
            user: decoded.id,
          },
          {
            isActive: false,
          },
        );
      } catch {
        // ignore invalid token on logout
      }
    }

    res.clearCookie("refreshToken", getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// ✅ GET ACTIVE SESSIONS
export const getMyDeviceSessions = async (req, res) => {
  try {
    const sessions = await DeviceSession.find({
      user: req.user._id,
      isActive: true,
    })
      .select("deviceName ipAddress userAgent lastUsedAt createdAt expiresAt")
      .sort({ lastUsedAt: -1 });

    return res.status(200).json({
      success: true,
      sessions,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch device sessions",
    });
  }
};

// ✅ REVOKE DEVICE SESSION
export const revokeDeviceSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await DeviceSession.findOneAndUpdate(
      {
        _id: sessionId,
        user: req.user._id,
      },
      {
        isActive: false,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to revoke session",
    });
  }
};

// ✅ GET LOGIN HISTORY
export const getMyLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      history,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch login history",
    });
  }
};
