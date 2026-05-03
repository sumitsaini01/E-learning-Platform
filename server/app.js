import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();

//core middleware
app.use(cors());        
app.use(express.json());

//security and logging 
app.use(helmet());       
app.use(morgan("dev"));   

//routes
app.use("/api/health", healthRoutes);

export default app;
