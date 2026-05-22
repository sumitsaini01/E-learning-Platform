import crypto from "crypto";
import Razorpay from "razorpay";
import Course from "../models/Course.js";
import Order from "../models/Order.js";

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

/**
 * POST /api/payment/create-order
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

/**
 * POST /api/payment/verify
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

/**
 * GET /api/payment/my-purchases
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
