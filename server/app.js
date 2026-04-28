const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/healthRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

//core middleware
app.use(cors());        
app.use(express.json());

//security and logging 
app.use(helmet());       
app.use(morgan("dev"));   

//routes
app.use("/api/health", healthRoutes);

//error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

