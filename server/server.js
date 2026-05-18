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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.use("/api/auth", authRoutes);     // ✅ RESTORED
    app.use("/api/courses", courseRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/progress", progressRoutes);
    app.use("/api/payment", paymentRoutes);

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