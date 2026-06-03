import crypto from "crypto";
import Razorpay from "razorpay";
import Course from "../models/Course.js";
import Order from "../models/Order.js";
import { createActivity, createNotification } from "../utils/activityHelper.js";
import sendEmail from "../utils/sendEmail.js";

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const isStudentEnrolled = (course, userId) => {
  return course.students.some(
    (studentId) => studentId.toString() === userId.toString(),
  );
};

/*
  POST /api/payment/create-order
*/
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Only published courses can be purchased",
      });
    }

    if (isStudentEnrolled(course, req.user._id)) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    if (Number(course.price) <= 0) {
      course.students.addToSet(req.user._id);
      await course.save();

      await createActivity({
        user: req.user._id,
        role: "student",
        type: "course_enrolled",
        title: "Course Enrolled",
        message: `You enrolled in ${course.title}`,
        course: course._id,
      });

      await createNotification({
        recipient: req.user._id,
        type: "course_purchase",
        title: "Course Enrollment Successful",
        message: `You successfully enrolled in ${course.title}`,
        course: course._id,
      });

      await createNotification({
        recipient: course.instructor,
        type: "new_student_enrolled",
        title: "New Student Enrollment",
        message: `${req.user.name || "A student"} enrolled in ${course.title}`,
        course: course._id,
      });

      try {
        await sendEmail({
          to: req.user.email,
          subject: `You are enrolled in ${course.title}`,
          html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Course Enrollment Successful</h2>
        <p>Hello ${req.user.name || "Student"},</p>
        <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
        <p>You can now start learning from your SkillSphere dashboard.</p>
      </div>
    `,
        });
      } catch (emailError) {
        console.error("Enrollment email failed:", emailError.message);
      }

      return res.status(200).json({
        success: true,
        free: true,
        message: "Free course enrolled successfully",
        course,
      });
    }
    const existingPaidOrder = await Order.findOne({
      user: req.user._id,
      course: course._id,
      status: "paid",
    });

    if (existingPaidOrder) {
      return res.status(409).json({
        success: false,
        message: "You have already purchased this course",
      });
    }

    const razorpay = getRazorpayInstance();

    const amountInPaise = Math.round(Number(course.price) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now().toString().slice(-10)}`,
      notes: {
        courseId: course._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    const order = await Order.create({
      user: req.user._id,
      course: course._id,
      amount: Number(course.price),
      currency: "INR",
      status: "created",
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
      success: true,
      free: false,
      key: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        courseId: course._id,
        courseTitle: course.title,
      },
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

/*
  POST /api/payment/verify
*/
export const verifyPayment = async (req, res) => {
  try {
    const {
      courseId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !courseId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const order = await Order.findOne({
      user: req.user._id,
      course: courseId,
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.status = "failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.students.addToSet(req.user._id);
    await course.save();

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    await createActivity({
      user: req.user._id,
      role: "student",
      type: "course_enrolled",
      title: "Course Purchased",
      message: `You purchased ${course.title}`,
      course: course._id,
    });

    await createNotification({
      recipient: req.user._id,
      type: "course_purchase",
      title: "Payment Successful",
      message: `You purchased ${course.title}`,
      course: course._id,
    });

    await createNotification({
      recipient: course.instructor,
      type: "new_student_enrolled",
      title: "New Course Purchase",
      message: `${req.user.name || "A student"} purchased ${course.title}`,
      course: course._id,
    });

    try {
      await sendEmail({
        to: req.user.email,
        subject: `Payment successful for ${course.title}`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Payment Successful</h2>
        <p>Hello ${req.user.name || "Student"},</p>
        <p>Your payment was successful and you are now enrolled in:</p>
        <h3>${course.title}</h3>
        <p>Amount Paid: <strong>₹${order.amount}</strong></p>
        <p>You can start learning from your SkillSphere dashboard.</p>
      </div>
    `,
      });
    } catch (emailError) {
      console.error("Payment success email failed:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Payment successful. You are enrolled in this course.",
      course,
      order,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

/*
  GET /api/payment/my-purchases
*/
export const getMyPurchasedCourses = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: "paid",
    })
      .populate({
        path: "course",
        populate: {
          path: "instructor",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    const purchases = orders.map((order) => ({
      orderId: order._id,
      amount: order.amount,
      purchasedAt: order.createdAt,
      course: order.course,
    }));

    return res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
