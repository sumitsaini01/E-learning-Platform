import dotenv from "dotenv";
import app from "./server/app.js";
import connectDB from "./server/config/db.js";
import { errorHandler, notFound } from "./server/middleware/errorMiddleware.js";
import courseRoutes from "./server/routes/courseRoutes.js";
import authRoutes from "./server/routes/authRoutes.js";
import reviewRoutes from "./server/routes/reviewRoutes.js";
import progressRoutes from "./server/routes/progressRoutes.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.use("/api/auth", authRoutes);     // ✅ RESTORED
    app.use("/api/courses", courseRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/progress", progressRoutes);

    app.use(notFound);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();