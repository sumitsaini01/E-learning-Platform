import Razorpay from "razorpay";
import crypto from "crypto";
import Course from "../models/Course.js";

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// 🔥 CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.price) {
      return res.status(400).json({ message: "Course price not set" });
    }

     const razorpay = getRazorpayInstance();

    const options = {
      amount: course.price * 100, // convert ₹ → paise
      currency: "INR",
      receipt: `receipt_${course._id}`,
    };

   
    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// 🔥 VERIFY PAYMENT + ENROLL USER
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const course = await Course.findById(courseId);

    if (!course.students.includes(req.user._id)) {
      course.students.push(req.user._id);
      await course.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment successful & user enrolled",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};