import dotenv from "dotenv";
dotenv.config(); // keep this (safe + standard)
import app from "./app.js";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import courseRoutes from "./routes/courseRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import careerRoadmapRoutes from "./routes/careerRoadmapRoutes.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.use("/api/auth", authRoutes); // ✅ RESTORED
    app.use("/api/courses", courseRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/progress", progressRoutes);
    app.use("/api/payment", paymentRoutes);
    app.use("/api/quizzes", quizRoutes);
    app.use("/api/certificates", certificateRoutes);
    app.use("/api/activities", activityRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/uploads", uploadRoutes);
    app.use("/api/discussions", discussionRoutes);
    app.use("/api/notes", noteRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/career-roadmaps", careerRoadmapRoutes);
    
    app.use(notFound);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
