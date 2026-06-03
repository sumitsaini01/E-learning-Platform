import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOtp: {
      type: String,
      select: false,
    },

    emailVerificationOtpExpire: {
      type: Date,
      select: false,
    },

    password: {
      type: String,
      required: true,
      select: false,
      minlength: 6,
    },

    passwordChangedAt: {
      type: Date,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },

    avatar: {
      type: String,
      default: "",
    },

    learningStreak: {
      currentStreak: {
        type: Number,
        default: 0,
      },

      longestStreak: {
        type: Number,
        default: 0,
      },

      lastActivityDate: {
        type: Date,
        default: null,
      },
    },

    learningActivity: [
      {
        date: {
          type: Date,
          required: true,
        },

        count: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    savedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

userSchema.methods.getEmailVerificationOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerificationOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  this.emailVerificationOtpExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

const User = mongoose.model("User", userSchema);

export default User;
